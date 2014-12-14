/**
 * Stream
 * Represents a STREAM that can be comes from the Camera, the screen/App sharing or a remote peer
 * A stream can contain several tracks
 */

var adapter = require('../others/adapter'),
    logger = require('../others/log'),
    Events = require('../others/event');

var LOG_ID = 'STREAM';

function Stream(stream, media, type) {
    var that = this;

    this._videoTrack = null;
    this._audioTrack = null;
    this._stream = stream  || null;
    this._type = type || "local";
    this._media = media || "video";
    this._events = new Events();
    this._id = this._stream ? (this._stream.id ? this._stream.id : new Date().getTime()) : new Date().getTime();
    
    logger.log(LOG_ID, 'Create a new Stream', {id: this._id, mediastream: this._stream, type: type, media: media});

    if(this._stream) {
        // Subscribe to stream events
        this._stream.onaddtrack = function(track) {
            logger.log(LOG_ID, 'Track added from MediaStream ' + that._stream.id, track);
        };  

        this._stream.onremovetrack = function(track) {
            logger.log(LOG_ID, 'Track removed to MediaStream ' + that._stream.id, track);
        };

        this._stream.onended = function() {
            if(that._type === 'local') {
                logger.log(LOG_ID, 'Local MediaStream has ended', that._stream);
                that._events.trigger('onLocalVideoStreamEnded', {stream: that._stream});    
            }
            else {
                logger.log(LOG_ID, 'Remote MediaStream has ended', that._stream);
                that._events.trigger('onRemoteVideoStreamEnded', {stream: that._stream});    
            }
        };
        
        var videoTracks = adapter.getVideoTracks(this._stream);
        var audioTracks = adapter.getAudioTracks(this._stream);
        if(videoTracks.length > 0) {
            this._videoTrack = videoTracks[0];
            
            // Subscribe to track events for video track
            this._videoTrack.onended = function(event) {
                logger.log(LOG_ID, 'Video Track has ended', event.target);
            };

            this._videoTrack.onmute = function(event) {
                logger.log(LOG_ID, 'Video Track has been muted', event.target);
            };

            this._videoTrack.onunmute = function(event) {
                logger.log(LOG_ID, 'Video Track has been unmuted', event.target);
            };

            logger.log(LOG_ID, 'With a VideoTrack', this._videoTrack);
        }
        else {
            logger.log(LOG_ID, "Without a VideoTrack");
        }
        if(audioTracks.length > 0) {
            this._audioTrack = audioTracks[0];
            
            // Subscribe to track events for audio track
            this._audioTrack.onended = function(event) {
                logger.log(LOG_ID, 'Audio Track has ended', event.target);
            };

            this._audioTrack.onmute = function(event) {
                logger.log(LOG_ID, 'Audio Track has been muted', event.target);
            };

            this._audioTrack.onunmute = function(event) {
                logger.log(LOG_ID, 'Audio Track has been unmuted', event.target);
            };

            logger.log(LOG_ID, 'With an AudioTrack', this._audioTrack);
        }
        else {
            logger.log(LOG_ID, "Without an AudioTrack");
        }
    }
}

Stream.prototype.getMedia = function() {
    return this._media;
};

Stream.prototype.getType = function() {
    return this._type;
};

Stream.prototype.get = function() {
    return(this._stream);
};

Stream.prototype.getVideoTrack = function() {
    return (this._videoTrack);
};

Stream.prototype.getAudioTrack = function() {
    return (this._audioTrack);
};

Stream.prototype.ID = function() {
    return (this._id);
};

Stream.prototype.on = function(eventName, callbackFunction, context) {
    this._events.on(eventName, callbackFunction, context);
};

Stream.prototype.off = function(eventName, callbackFunction) {
    this._events.off(eventName, callbackFunction);
};

Stream.prototype.stop = function() {
    var _FFFix = false;

    logger.log(LOG_ID, 'Try to stop the stream <' + this._id + '>');

    if(this._videoTrack) {
                
        if (typeof this._videoTrack.stop === 'function') { 
            logger.log(LOG_ID, 'Stop the video track <' + this._videoTrack.id + '>');
            this._videoTrack.stop(); 
        }
        else {
            _FFFix = true;
        }
        
    }

    if(this._audioTrack) {
        
        if (typeof this._audioTrack.stop === 'function') {
            logger.log(LOG_ID, 'Stop the audio track <' + this._audioTrack.id + '>');
            this._audioTrack.stop();
        }
        else {
            _FFFix = true;
        }
    }

    if(_FFFix) {
        logger.log(LOG_ID, 'Stop the stream <' + this._id + '>');
        this._stream.stop();    
    }
    
};

module.exports = Stream;

