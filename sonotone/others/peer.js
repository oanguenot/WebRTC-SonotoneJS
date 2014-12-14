/**
 * Peer
 * Represents a peer (a user)
 * A peer can have several PeerConnection to him
 * One for Video, one for screen...
 */

var adapter = require('../others/adapter'),
    logger = require('../others/log'),
    Events = require('../others/event'),
    localMedia = require('sonotone/stream/localMedia'),
    Capabilities = require('../others/capabilities'),
    PeerConnection = require('sonotone/rtc/peerConnection'),
    RemoteMedia = require('sonotone/stream/remoteMedia');

var LOG_ID = 'PEER';

function Peer(id) {
    this._id = id || '' + new Date().getTime();
    this._events = new Events();
    this._caps = null;
    this._pc = {};
    this._remoteMedia = {};

    this._alreadyReceivedCandidates = [];

    logger.log(LOG_ID, 'Create a new Peer <' + this._id + '>');
}

/**
 * Subscribe to Local Media events
 * @param {String} eventName The event to subscribe
 * @param {Function} callbackFunction The function to call
 * @param {Object} context The context to use when calling the callback function
 *
 * @api public
 */

Peer.prototype.on = function(eventName, callbackFunction, context) {
   this._events.on(eventName, callbackFunction, context);
};

/**
 * Unsubscribe to IO events
 * @param {String} eventName The event to unsubscribe
 * @param {Function} callbackFunction The registered callback
 *
 * @api public
 */    

Peer.prototype.off = function(eventName, callbackFunction) {
    this._events.off(eventName, callbackFunction);
};

/**
 * Get/Set the Peer Capabilities
 */

Peer.prototype.caps = function(capabilities) {
    if(capabilities) {
        this._caps = capabilities;
    }
    return this._caps;
};

/**
 * Get the ID of the peer
 */

Peer.prototype.ID = function() {
    return this._id;
};

/**
 * Call a peer with a specified media (screen or video)
 * @param {String} media    The media used
 * @param {Object} offer    The offer if exists
 * @param {String} audioCodec 'g711', 'opus' or default order of browser if null
 * @param {String} videoCodec 'vp8' or 'h264' or default order of browser if null 
 */

Peer.prototype.call = function(media, offer, audioCodec, videoCodec) {
 
    var pc = null;

    media = media || 'video';

    if(offer) {
        logger.log(LOG_ID, "Answer peer <" + this._id + "> using " + media );
    }
    else {
        logger.log(LOG_ID, "Call peer <" + this._id + "> using " + media );    
    }

    if(media !== 'screen' && media !== 'video') {
        logger.log(LOG_ID, "Error, media unknown", media);      
        return 'media_unknown';
    }

    if(this._pc[media]) {
        logger.log(LOG_ID, "Error, already in call with this media", media);        
        return "already_in_call";
    }

    // Create PeerConnection
    pc = new PeerConnection(media, this._id);

    // Subscribe to PeerConnections events
    pc.on('onSDPOfferToSend', function(event) {
        this._events.trigger('onSDPOfferToSend', event);
    }, this);

    pc.on('onSDPAnswerToSend', function(event) {
        this._events.trigger('onSDPAnswerToSend', event);
    }, this);

    pc.on('onSDPLocalMediaUsed', function(event) {
        this._events.trigger('onSDPLocalMediaUsed', event);
    }, this);

    pc.on('onSDPCodecsNegotiated', function(event) {
        this._events.trigger('onSDPCodecsNegotiated', event);
    }, this);    

    pc.on('onSDPRemoteMediaUsed', function(event) {
        this._events.trigger('onSDPRemoteMediaUsed', event);
    }, this);    

    pc.on('onICECandiateReceived', function(event) {

        if(!pc.isConnected()) {

            logger.log(LOG_ID, "Send ICE Candidate received by Peer Connection <" + this._id + ">");

            var message = {
                data: {
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                },
                caller: Capabilities.ID(),
                callee: this._id,
                media: media
            };

            this._events.trigger('onICECandiateReceived', message);
        }
        else {
            logger.log(LOG_ID, "Do not send ICE Candidate because Peer Connection <" + this._id + "> is already connected");
        }

    }, this);

    pc.on('onICEConnected', function(event) {
        this._events.trigger('onICEConnected', event);
    }, this);

    pc.on('onICECompleted', function(event) {
        this._events.trigger('onICECompleted', event);
    }, this);

    pc.on('onICEFailed', function(event) {
        this._events.trigger('onICEFailed', event);
    }, this);

    pc.on('onICEClosed', function(event) {
        this._events.trigger('onICEClosed', event);
    }, this);

    pc.on('onICEDisconnected', function(event) {
        this._events.trigger('onICEDisconnected', event);
    }, this);    

    pc.on('onICECandidateEnd', function(event) {
        pc.addEarlyCandidates();
    }, this);

    pc.on('onRemoteStreamReceived', function(event) {
        
        this._remoteMedia[media] = new RemoteMedia(event.stream, media);
        this._remoteMedia[media].on('onRemoteVideoStreamEnded', function(json) {
            this._events.trigger('onRemoteVideoStreamEnded', json);
        }, this);

        var evt = {id: this._id, media: media, stream: event.stream};

        if(media === 'video') {
            logger.log(LOG_ID, "Remote Video Stream started...", event);
            this._events.trigger('onRemoteVideoStreamStarted', evt);
        }
        else {
            logger.log(LOG_ID, "Remote Screen Stream started...", event);
            this._events.trigger('onRemoteScreenStreamStarted', evt);    
        }
    }, this);

    pc.on('onStat', function(event) {
        this._events.trigger('onStat', event);
    }, this);

    this._pc[media] = pc;

    switch(media) {
        case 'video':
            if(localMedia.isCameraCaptured()) {
                pc.attach(localMedia.streamCamera());
            }
            break;
        case 'screen':
            if(localMedia.isScreenCaptured()) {
                pc.attach(localMedia.streamScreen());
            }
            break;
    }

    if(offer) {
        pc.setRemoteDescription(adapter.RTCSessionDescription(offer.data));
        pc.createAnswer(media, this._alreadyReceivedCandidates);    
    }
    else {
        pc.createOffer(audioCodec, videoCodec);
    }
};

Peer.prototype.endCall = function(media) {
    logger.log(LOG_ID, "End call with peer <" + this._id + "> using " + media);
    if(media in this._pc) {
        pc = this._pc[media];
        pc.close();

        delete this._pc[media];
        pc = null;

        if(localMedia.isCameraCaptured()) {
            //Relase camera
            localMedia.releaseCamera();
        }
    }
};

Peer.prototype.addCandidate = function(media, candidate) {

    var pc = this._pc[media];

    if(!pc) {
        logger.log(LOG_ID, "Warning, Not in call with this media, store candidates", media);
        this._alreadyReceivedCandidates.push(candidate);
        return;
    }

    pc.addCandidate(candidate);
};

Peer.prototype.startStat = function(media, interval) {

    if(media in this._pc) {
        pc = this._pc[media];
        pc.activateStat(interval);
    }
};

Peer.prototype.stopStat = function(media) {
    
    if(media in this._pc) {
        pc = this._pc[media];
        pc.stopStat();
    }
};

Peer.prototype.setRemoteDescription = function(media, SDP) {
    var pc = this._pc[media];

    if(!pc) {
        logger.log(LOG_ID, "Warning, Not in call with this media", media);        
        return "not_in_call";
    }

    pc.setRemoteDescription(adapter.RTCSessionDescription(SDP));
};

Peer.prototype.getRemoteStream = function(media) {
    return this._remoteMedia[media];
};

/**
 * For testing only
 */

Peer.prototype._peerConnections = function(pcs) {
    this._pc = pcs;
};

module.exports = Peer;

