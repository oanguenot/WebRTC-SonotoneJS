/**
 * RemoteMedia
 * Represents a Remove Media that can be comes from the Camera, the screen/App sharing or a remote peer
 */

var adapter = require('../others/adapter'),
    logger = require('../others/log'),
    Events = require('../others/event'),
    Stream = require('./stream');

var LOG_ID = 'RemoteMedia';

function RemoteMedia(stream, media) {
    this._events = new Events();
    this._media = media;
    this._mediaStream = new Stream(stream, media, "remote"); 
    this._mediaStream.on('onRemoteVideoStreamEnded', function(json) {
        this._events.trigger('onRemoteVideoStreamEnded', json);
    }, this);
}

RemoteMedia.prototype.on = function(eventName, callbackFunction, context) {
    this._events.on(eventName, callbackFunction, context);
};

RemoteMedia.prototype.off = function(eventName, callbackFunction) {
    this._events.off(eventName, callbackFunction);
};

RemoteMedia.prototype.renderStream = function(HTMLMediaElement) {
    logger.log(LOG_ID, "Render a Remote Stream", HTMLMediaElement); 

    var that = this;

    HTMLMediaElement.onplay = function() {
        var ratio = adapter.getVideoRatio(HTMLMediaElement);
        logger.log(LOG_ID, "Video ratio received", ratio);
        HTMLMediaElement.onplay = null;
    };

    var stream = this._mediaStream.get();

    if(stream) {
        HTMLCamera = adapter.attachToMedia(HTMLMediaElement, stream);
        return HTMLCamera;    
    }
    else {
        logger.log(LOG_ID, "No stream to render");
        return null;
    }
};

module.exports = RemoteMedia;