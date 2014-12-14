var logger = require('../others/log'),
    adapter = require('../others/adapter'),
    Events = require('../others/event'),
    Stream = require('./stream');

var LOG_ID = 'LOCALMEDIA';

var isScreenCaptured = false,
    isCameraCaptured = false;

var streamCamera = null,
    streamScreen = null;

var events = new Events();
var mediaStream = null; 

var HTMLCamera = null;

var quality = {
    'qqvga' :   {maxWidth: 160, maxHeight: 120, minWidth: 160, minHeight: 120},       //4:3
    'qcif'  :   {maxWidth: 176, maxHeight: 144, minWidth: 176, minHeight: 144},       //4:3
    'qvga'  :   {maxWidth: 320, maxHeight: 240, minWidth: 320, minHeight: 240},       //4:3
    'cif'   :   {maxWidth: 352, maxHeight: 288, minWidth: 352, minHeight: 288},       //4:3
    'vga'   :   {maxWidth: 640, maxHeight: 480, minWidth: 640, minHeight: 480},       //4:3
    'svga'  :   {maxWidth: 800, maxHeight: 600, minWidth: 800, minHeight: 600},       //4:3
    'cam'   :   {maxWidth: 960, maxHeight: 720, minWidth: 960, minHeight: 720},       //4:3
    '720p'  :   {maxWidth: 1280, maxHeight: 720, minWidth: 1280, minHeight: 720},     //16:9
    'uxga'  :   {maxWidth: 1600, maxHeight: 1200, minWidth: 1600, minHeight: 1200},   //4:3
    '1080p' :   {maxWidth: 1920, maxHeight: 1080, minWidth: 1920, minHeight: 1080},   //16:9 
    '4k'    :   {maxWidth: 3840, maxHeight: 2160, minWidth: 3840, minHeight: 2160}    //16:9 
};

var default_quality = {maxWidth: 320, maxHeight: 240};

/* -------------------------------- Private functions --------------------------- */

var _getMediaConstraints = function _getMediaConstraints(audio, video, format) {
        
    var mediaConstraints = {
        audio: {
            mandatory: {
            },
            optional: [
                {echoCancelation: true},
                {googEchoCancellation: true},
                {googEchoCancellation2: true},
                {googAutoGainControl: true},
                {googAutoGainControl2: true},
                {googNoiseSupression: true},
                {googNoisesuppression2: true},
                {googHighpassFilter: true},
                {googTypingNoiseDetection: true},
                {googAudioMirroring:false}
            ]
        }
    };

    if(audio.source.length > 0) {
        mediaConstraints.audio.optional.push({sourceId: audio.source});
    }

    if (video.media) {
        //Add th video constraints if needed
        mediaConstraints.video = {
            mandatory: format,
            optional: [
                // {googLeakyBucket: true},
                // {googNoiseReduction: true}
            ]
        };

        if(video.source.length > 0) {
            mediaConstraints.video.optional.push({sourceId: video.source});
        }
    }
    return mediaConstraints;
};

/* -------------------------------- Public functions --------------------------- */

logger.log(LOG_ID, "Module started...");

module.exports = {

    /**
     * Start accessing to the local Media
     * @param {Boolean} withAudio True to have audio enabled
     * @param {Boolean} withVideo True to have video enabled
     * @param {String} Video Quality or null/undefined for audio only
     *
     * @api public
     */

    acquire: function(audioProfile, videoProfile, format) {

        var qualityAsked = default_quality;
        
        if(format && format in quality) {
            qualityAsked = quality[format];
        }

        if(videoProfile.media) {
            logger.log(LOG_ID, 'Ask for camera', {audio: audioProfile.media, audioSource: audioProfile.source, video: videoProfile.media, videoSource: videoProfile.source, name: format, quality: qualityAsked});    
        }
        else {
            logger.log(LOG_ID, 'Ask for camera', {audio: audioProfile.media, audioSource: audioProfile.source}); 
        }

        var constraints = _getMediaConstraints(audioProfile, videoProfile, qualityAsked);

        logger.log(LOG_ID, "Local constraints asked", constraints);

        adapter.getUserMedia(constraints, function(stream) {
            logger.log(LOG_ID, "User has granted access to local media - Camera", stream);
            streamCamera = stream;
            mediaStream = new Stream(stream, "video", "local");
            mediaStream.on('onLocalVideoStreamEnded', function(json) {
                events.trigger('onLocalVideoStreamEnded', json);
            }, this);
            isCameraCaptured = true;
            events.trigger('onLocalVideoStreamStarted', {media: 'video', stream: stream});
        }, function(err) {
            logger.log(LOG_ID, 'Failed to get access to local media', err);
            streamCamera = null;
            isCameraCaptured = false;
            events.trigger('onLocalVideoStreamError', {code: 1, message:"", name: "PERMISSION_DENIED"});
        }, this);
    },

    /**
     * Release the camera stream
     */

    releaseCamera: function() {
        if(!isCameraCaptured) {
            logger.log(LOG_ID, 'No stream to release');
            return;
        }

        mediaStream.stop();
    },

    /**
     * Is a screen stream captured and ready to be sent
     *
     * @api public
     */

    isScreenCaptured: function() {
        return isScreenCaptured;
    },

    /**
     * Is a camera stream captured and ready to be sent
     *
     * @api public
     */

    isCameraCaptured: function() {
        return isCameraCaptured;
    },

    /**
     * Get the Local Video Stream
     *
     * @api public
     */

    streamCamera: function(camera) {
        if(camera) {
            streamCamera = camera;
            isCameraCaptured = true;
        }
        return streamCamera;
    },

    /**
     * Get the Local Video Stream
     *
     * @api public
     */

    streamScreen: function(screen) {
        if(screen) {
            streamScreen = screen;
            isScreenCaptured = true;
        }
        return streamScreen;
    },

    /**
     * Attach the Local video stream to a <video> or <canvas> element
     *
     * @api public
     */

    renderCameraStream: function(HTMLMediaElement) {
        logger.log(LOG_ID, "Render the Camera stream", HTMLMediaElement); 

        var that = this;

        HTMLMediaElement.onplay = function() {
            var ratio = adapter.getVideoRatio(HTMLMediaElement);
            logger.log(LOG_ID, "Video ratio detected", ratio);
            HTMLMediaElement.onplay = null;
        };

        HTMLMediaElement.onended = function() {
            logger.log("LOG_ID", "Video ended detected");
            //ACK: FF doesn't detect MediaTrack end (MAC, Win too ?)
            events.trigger('onLocalVideoStreamEnded', {stream: streamCamera});
        };

        if(streamCamera) {
            HTMLCamera = adapter.attachToMedia(HTMLMediaElement, streamCamera);
            return HTMLCamera;    
        }
        else {
            logger.log(LOG_ID, "No stream to render");
            return null;
        }
    },

    /**
     * Subscribe to Local Media events
     * @param {String} eventName The event to subscribe
     * @param {Function} callbackFunction The function to call
     * @param {Object} context The context to use when calling the callback function
     *
     * @api public
     */

    on: function(eventName, callbackFunction, context) {
       events.on(eventName, callbackFunction, context);
    },

    /**
     * Unsubscribe to IO events
     * @param {String} eventName The event to unsubscribe
     * @param {Function} callbackFunction The registered callback
     *
     * @api public
     */    

    off: function(eventName, callbackFunction) {
        events.off(eventName, callbackFunction);
    },

    _setAdapter: function(adp) {
        adapter = adp;
    }
};