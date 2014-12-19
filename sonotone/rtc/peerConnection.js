/**
 * PeerConnection
 * Represents a WEBRTC PeerConnection Object
 * By default the PeerConnection embeds a DataChannel 'data'
 * It can have an associated video stream 'video' or a screen stream 'screen'
 */

var adapter = require('../others/adapter'),
    logger = require('../others/log'),
    config = require('../others/configuration'),
    capabilities = require('../others/capabilities'),
    Events = require('../others/event'),
    sdpSwapper = require('../others/sdp'),
    statAdapter = require('../others/stat');

var LOG_ID = 'PEERCONNECTION';

/**
* Merge media constraints
*
* @api private
*/

var mergeConstraints = function mergeConstraints(cons1, cons2) {
    var merged = cons1;
    for (var name in cons2.mandatory) {
      merged.mandatory[name] = cons2.mandatory[name];
    }
    merged.optional.concat(cons2.optional);
    return merged;
};

/**
 * Callback for ICECandidate
 */

var onICECandidate = function onICECandidate(event) {
    if(event.candidate) {
        logger.log(LOG_ID, "Get local ICE CANDIDATE from PEER CONNECTION <" + this._id + ">", event);
        this._events.trigger('onICECandiateReceived', event);
    }
    else {
        logger.log(LOG_ID, "No more local candidate to PEER CONNECTION <" + this._id + ">", event);
        //Todo send SDP
        var msg = {
            // data: {
            //     type: 'offer',
            //     sdp: that.getLocalDescription().sdp
            // }, 
            // caller: Sonotone.ID,
            // callee:  that._id.substring(1),
            // media: that._media,
            // channel: false,
            // muted: false
        };
        this._events.trigger("onICECandidateEnd", msg);
    }
};

var onAddStream = function onAddStream(event) {
    logger.log(LOG_ID, "Remote stream added from PEER CONNECTION <" + this._id + ">", event);
    this._stream = event.stream;
    this._events.trigger('onRemoteStreamReceived', {media: this._media, stream: event.stream});
};

var onRemoveStream = function onRemoveStream(event) {
    logger.log(LOG_ID, "Remote stream removed from PEER CONNECTION <" + this._id + ">");
};

var onICEConnectionStateChange = function onICEConnectionStateChange(event) {
    var state = event.target.iceConnectionState;
    logger.log(LOG_ID, "On Ice Connection state changes to " + state + " for PEER CONNECTION <" + this._id + ">", event);
    
    switch (state) {
        case 'connected':
            this._events.trigger('onICEConnected', event);
            break;
        case 'completed':
            this._events.trigger('onICECompleted', event);
            break;
        case 'disconnected':
            this._events.trigger('onICEDisconnected', event);
            this.close();
            this.stopStat();
            break;
        case 'closed':
            this._events.trigger('onICEClosed', event);
            break; 
        case 'failed':
            this._events.trigger('onICEFailed', event);
            break;
    }
};

var onNegotiationNeeded = function onNegotiationNeeded(event) {
    logger.log(LOG_ID, "On negotiation needed for PEER CONNECTION <" + this._id + ">", event);
};

var onSignalingStateChange = function onSignalingStateChange(event) {
    var signalingState = "";
    if(event.target) {
        signalingState = event.target.signalingState;
    }
    else if(event.currentTarget) {
        signalingState = event.currentTarget.signalingState;
    }
    else {
        signalingState = event;
    }
    logger.log(LOG_ID, "On signaling state changes to " + signalingState + " for PEER CONNECTION <" + this._id + ">", event);
};

var onClosedConnection = function onClosedConnection(event) {
    logger.log(LOG_ID, "Connection closed for PEER CONNECTION <" + this._id + ">", event);
};

var onConnection = function onConnection(event) {
    logger.log(LOG_ID, "Connection opened for PEER CONNECTION <" + this._id + ">", event);
};

var onOpen = function onOpen(event) {
    logger.log(LOG_ID, "On Open for PEER CONNECTION <" + this._id + ">", event);
};

var onDataChannel = function onDataChannel(event) {
    logger.log(LOG_ID, "Received Data Channel from <" + this._id + ">", event);
};

/**
 * Constructor
 * @param {String} media Should be video or screen
 * @param {String} id  The ID of the peer
 */

function PeerConnection(media, id) {
    this._media = media || 'video';

    this._id = this._media.substring(0,1) + (id || '' + new Date().getTime());

    this._peerID =id;

    this.offerPending = false;

    this._isCaller = false;

    this._isConnected = false;

    this._answerCreated = false;

    this._tmpICE = [];

    this._events = new Events();

    this._stream = null;

    this._statID = -1;

    logger.log(LOG_ID, 'Create new PeerConnection <' + this._id + '>');

    var peerConnectionConstraints = {
        optional: [
            {googIPv6: true},
            {googImprovedWifiBwe: true},
            {googScreencastMinBitrate: 400}
        ]
    };

    this._peer = adapter.RTCPeerConnection(config.getICEConfiguration(), peerConnectionConstraints);    

    if(this._peer) {

        logger.log(LOG_ID, 'PeerConnection created for <' + this._id + '>', this._peer);

        this._peer.onicecandidate = onICECandidate.bind(this);
        this._peer.onaddstream = onAddStream.bind(this);
        this._peer.onremovestream = onRemoveStream.bind(this);
        this._peer.oniceconnectionstatechange = onICEConnectionStateChange.bind(this);
        this._peer.onnegotiationneeded = onNegotiationNeeded.bind(this);
        this._peer.onsignalingstatechange = onSignalingStateChange.bind(this);
        this._peer.onclosedconnection = onClosedConnection.bind(this);
        this._peer.onconnection = onConnection.bind(this);
        this._peer.onopen = onOpen.bind(this);
        this._peer.ondatachannel = onDataChannel.bind(this);
    }
    else {
        logger.log(LOG_ID, 'PeerConnection failed for <' + this._id + '>');
    }
}

/**
 * ID of the Peer Connection
 *
 * @api public
 */

PeerConnection.prototype.ID = function(id) {
    if(id !== undefined && id !== null) {
        this._peerID = id;
        this._id = this._media.substring(0,1) + id;
    }
    return this._peerID;
};

/**
 * Get the media of this peerConnection
 */

PeerConnection.prototype.media = function() {
    return this._media;
};

/**
 * Get the PeerConnection 
 *
 * @api public
 */

PeerConnection.prototype.peerConnection = function() {
    return this._peer;
};

/**
 * Attach a MediaStream to a peer
 * @param {Object} stream The MediaStream to add
 */

PeerConnection.prototype.attach = function(stream) {
    logger.log(LOG_ID, "Attach a stream to the Peer Connection <" + this._id + ">");

    if(!stream) {
        logger.log(LOG_ID, "No stream to add to the Peer Connection <" + this._id + ">");
        return "no_stream_to_attach";
    }

    var streams = this._peer.getLocalStreams(),
        alreadyAdded = false;
        
    for (var i=0;i< streams.length;i++) {
        if(streams[i].id === stream.id) {
            alreadyAdded = true;
        }
    }

    this._streamForcedDetached = false;

    //As getStreamById is not yet implemented in Firefox, we should use the getLocalStreams method
    //if(this._peer.getStreamById(stream.id) == null) {
    if(!alreadyAdded) {
        this._peer.addStream(stream);
    }
    else {
        logger.log(LOG_ID, "Stream already added to the Peer Connection <" + this._id + ">");
    }
};


/**
 * Create an offer for calling an other peer
 * @param {Object} mediaConstraints Additionnal constraints that contains: 
 * @param {String} audioCodec 'g711', 'opus' or default order of browser if null
 * @param {String} videoCodec 'vp8' or 'h264' or default order of browser if null
 * @param {Number} audioBandwidth   The max bandwidth for audio
 * @param {Number} videoBandwidth   The max bandwidth for video
 * @param {Object} opus Opus specific options that contains
 *          @param {Boolean} useFEC True to use FEC
 *          @param {Boolean} useStereo True fo use the stereo
 */

PeerConnection.prototype.createOffer = function(mediaConstraints) {

    logger.log(LOG_ID, "Try to create an offer for <" + this._id + ">...");

    if(!this.offerPending) {

        var sdpConstraints = {
            'mandatory': {
                'OfferToReceiveAudio': this._media === 'screen' ? false : true,
                'OfferToReceiveVideo': this._media === 'screen' ? false : true 
            }
        };

        this._isCaller = true;

        this.offerPending = true;

        var muted = false;

        var offerConstraints = {"optional": [], "mandatory": {}};

        var constraints = mergeConstraints(offerConstraints, sdpConstraints);

        logger.log(LOG_ID, "Create the SDP offer for Peer Connection <" + this._id + ">", constraints);

        var that = this;

        this._peer.createOffer(function(offerSDP) {

            // Change the SDP to force some parameters
            if(mediaConstraints) {
                if(mediaConstraints.audioCodec  && mediaConstraints.audioCodec !== 'opus/48000/2') {
                    offerSDP.sdp = sdpSwapper.forceAudioCodecTo(offerSDP.sdp, mediaConstraints.audioCodec);
                    logger.log(LOG_ID, "SDP forced audio to " + mediaConstraints.audioCodec, offerSDP.sdp);    
                }
                else {
                    if(mediaConstraints.opus && mediaConstraints.opus.useFEC) {
                        offerSDP.sdp = sdpSwapper.addFECSupport(offerSDP.sdp);
                        logger.log(LOG_ID, "SDP add FEC support to Opus", offerSDP.sdp);
                    }

                    if(mediaConstraints.opus && mediaConstraints.opus.useStereo) {
                        offerSDP.sdp = sdpSwapper.addStereoSupport(offerSDP.sdp);
                        logger.log(LOG_ID, "SDP add Stereo support to Opus", offerSDP.sdp);
                    }
                }

                if(mediaConstraints.videoCodec && mediaConstraints.videoCodec !== 'VP8/90000') {
                    offerSDP.sdp = sdpSwapper.forceVideoCodecTo(offerSDP.sdp, mediaConstraints.videoCodec);
                    logger.log(LOG_ID, "SDP forced video to " + mediaConstraints.videoCodec, offerSDP.sdp);
                }

                if(mediaConstraints.audioBandwidth) {
                    offerSDP.sdp = sdpSwapper.limitAudioBandwidthTo(offerSDP.sdp, mediaConstraints.audioBandwidth);
                    logger.log(LOG_ID, "SDP limited audio to " + mediaConstraints.audioBandwidth, offerSDP.sdp);
                }

                if(mediaConstraints.videoBandwidth) {
                    offerSDP.sdp = sdpSwapper.limitVideoBandwidthTo(offerSDP.sdp, mediaConstraints.videoBandwidth);
                    logger.log(LOG_ID, "SDP limited video to " + mediaConstraints.videoBandwidth, offerSDP.sdp);
                }

            }

            var sdpMedia = sdpSwapper.getMediaInSDP(offerSDP.sdp);
            that._events.trigger('onSDPLocalMediaUsed', sdpMedia);

            logger.log(LOG_ID, "Set the SDP to local description for <" + that._id + ">", offerSDP);
            //offerSDP.sdp = preferOpus(offerSDP.sdp);
            that.setLocalDescription(offerSDP);
            
            var event = {
                data: offerSDP,
                caller: capabilities.ID(),
                callee:  that._peerID,
                media: that._media,
                muted: muted
            };

            that.offerPending = false;

            that._events.trigger('onSDPOfferToSend', event);

        }, function(error) {
            logger.log(LOG_ID, "Fail to create Offer for Peer Connection <" + that._id + ">", error);
            that.offerPending = false;
        }, constraints);

    }
};

/**
 * Create an answer for answering an other peer
 * @param {Object} mediaConstraints Additionnal constraints that contains: 
 * @param {String} audioCodec 'g711', 'opus' or default order of browser if null
 * @param {String} videoCodec 'vp8' or 'h264' or default order of browser if null
 * @param {Number} audioBandwidth   The max bandwidth for audio
 * @param {Number} videoBandwidth   The max bandwidth for video
 */

PeerConnection.prototype.createAnswer = function(media, candidates, mediaConstraints) {

    logger.log(LOG_ID, "Try to create an answer for <" + this._id + ">...");

    var sdpConstraints = {
        'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': true
        }
    };
                
    var that = this;

    this._isCaller = false;

    if(media === 'data') {
        sdpConstraints = null;
    }
                
    this._peer.createAnswer(function(answerSDP) {

        // Change tthe SDP to force some parameters
        if(mediaConstraints) {
            if(mediaConstraints.audioCodec  && mediaConstraints.audioCodec !== 'opus/48000/2') {
                answerSDP.sdp = sdpSwapper.forceAudioCodecTo(answerSDP.sdp, mediaConstraints.audioCodec);
                logger.log(LOG_ID, "SDP forced audio to " + mediaConstraints.audioCodec, answerSDP.sdp);    
            }
            else {
                if(mediaConstraints.useFEC) {
                    offerSDP.sdp = sdpSwapper.addFECSupport(offerSDP.sdp);
                    logger.log(LOG_ID, "SDP add FEC support to Opus", offerSDP.sdp);
                }

                if(mediaConstraints.useStereo) {
                    offerSDP.sdp = sdpSwapper.addStereoSupport(offerSDP.sdp);
                    logger.log(LOG_ID, "SDP add Stereo support to Opus", offerSDP.sdp);
                }
            }

            if(mediaConstraints.videoCodec && mediaConstraints.videoCodec !== 'VP8/90000') {
                answerSDP.sdp = sdpSwapper.forceVideoCodecTo(answerSDP.sdp, mediaConstraints.videoCodec);
                logger.log(LOG_ID, "SDP forced video to " + mediaConstraints.videoCodec, answerSDP.sdp);
            }

            if(mediaConstraints.audioBandwidth) {
                answerSDP.sdp = sdpSwapper.limitAudioBandwidthTo(answerSDP.sdp, mediaConstraints.audioBandwidth);
                logger.log(LOG_ID, "SDP limited audio to " + mediaConstraints.audioBandwidth, answerSDP.sdp);
            }

            if(mediaConstraints.videoBandwidth) {
                answerSDP.sdp = sdpSwapper.limitVideoBandwidthTo(answerSDP.sdp, mediaConstraints.videoBandwidth);
                logger.log(LOG_ID, "SDP limited video to " + mediaConstraints.videoBandwidth, answerSDP.sdp);
            }
        }

        //answerSDP.sdp = preferOpus(answerSDP.sdp);
        that.setLocalDescription(answerSDP);
                  
        logger.log(LOG_ID, "Send this SDP answer to the remote peer <" + that._id + ">");

        var event = {
            data: answerSDP,
            caller: capabilities.ID(),
            callee: that._peerID,
            media: media
        };

        that._events.trigger('onSDPAnswerToSend', event);

        var sdpMedia = sdpSwapper.getMediaInSDP(answerSDP.sdp);
        var audioCodec = sdpSwapper.getFirstAudioCodec(answerSDP.sdp),
            videoCodec = sdpSwapper.getFirstVideoCodec(answerSDP.sdp);

        that._events.trigger('onSDPLocalMediaUsed', sdpMedia);
        that._events.trigger('onSDPCodecsNegotiated', {audio: audioCodec, video: videoCodec});

        if(candidates) {
            while(candidates.length > 0) {
                that.addCandidate(candidates.pop());
            }    
        }

    }, function(error) {
        logger.log(LOG_ID, "Fail to create Answer for Peer Connection <" + that._id + ">", error);
    }, sdpConstraints);

    this._answerCreated = true;
};

PeerConnection.prototype.addCandidate = function(candidate) {
    
    var ICE = adapter.RTCIceCandidate({sdpMLineIndex:candidate.label, candidate:candidate.candidate, id: candidate.sdpMid});
    if(this._answerCreated || this._isCaller) {
        
        if(!this._isConnected) {
            logger.log(LOG_ID, "Add ICE CANDIDATE to the Peer Connection <" + this._id + ">", candidate);
            this._peer.addIceCandidate(ICE);    
        }
        else {
            logger.log(LOG_ID, "DO not add ICE CANDIDATE because to already connected Peer Connection <" + this._id + ">");
        }
    }
    else {
        logger.log(LOG_ID, "ANSWER not yet created. Postpone ICE for Peer Connection <" + this._id + ">");
        this._tmpICE.push(ICE);
    }
};

PeerConnection.prototype.addEarlyCandidates = function() {

    if(this._tmpICE !== null && this._tmpICE.length > 0) {

        logger.log(LOG_ID, "Add previously stored ICE Candidate to Peer Connection <" + this._id + ">");

        while(this._tmpICE.length > 0) {
            var ICE = this._tmpICE.pop();
            this.addCandidate(ICE);
        }
    }
    else {
        logger.log(LOG_ID, "All Candidates have been added to Peer Connection <" + this._id + ">");
    }

};

/**
 * Store the SDP into the Local Description of the peer
 * @param {Objet} SDP The JSON SDP message
 *
 * @api public
 */

PeerConnection.prototype.setRemoteDescription = function(SDP) {
    logger.log(LOG_ID, "Store the SDP parameters to the remote description of Peer Connection <" + this._id + ">");
    this._peer.setRemoteDescription(SDP);

    var sdpMedia = sdpSwapper.getMediaInSDP(SDP.sdp);
    this._events.trigger('onSDPRemoteMediaUsed', sdpMedia);

    var audioCodec = sdpSwapper.getFirstAudioCodec(SDP.sdp),
        videoCodec = sdpSwapper.getFirstVideoCodec(SDP.sdp);

    this._events.trigger('onSDPCodecsNegotiated', {audio: audioCodec, video: videoCodec});
};

/**
 * Store the SDP into the Local Description of the peer
 * @param {Objet} SDP The JSON SDP message
 *
 * @api public
 */

PeerConnection.prototype.setLocalDescription = function(SDP) {
    logger.log(LOG_ID, "Store the SDP parameters to the local description of Peer Connection <" + this._id + ">");
    this._peer.setLocalDescription(SDP);
};

/**
 * Get the local description
 */

PeerConnection.prototype.getLocalDescription = function() {
    if(this._peer) {
        return this._peer.localDescription;    
    }
    else {
        return null;
    }
    
};

/**
 * True if this peerConnection has initialized the call
 */

PeerConnection.prototype.amICaller = function() {
    return this._isCaller;
};

PeerConnection.prototype.isConnected = function() {
    return this._isConnected;
};

/**
 * Subscribe to Local Media events
 * @param {String} eventName The event to subscribe
 * @param {Function} callbackFunction The function to call
 * @param {Object} context The context to use when calling the callback function
 *
 * @api public
 */

PeerConnection.prototype.on = function(eventName, callbackFunction, context) {
   this._events.on(eventName, callbackFunction, context);
};

/**
 * Unsubscribe to IO events
 * @param {String} eventName The event to unsubscribe
 * @param {Function} callbackFunction The registered callback
 *
 * @api public
 */    

PeerConnection.prototype.off = function(eventName, callbackFunction) {
    this._events.off(eventName, callbackFunction);
};

/**
 * Test function only
 */

PeerConnection.prototype._onICECandidate = function(event) {
    onICECandidate.call(this, event);
};

PeerConnection.prototype.close = function() {
    logger.log(LOG_ID, "Close the Peer Connection <" + this._id + ">");
    if(this._peer) {
        this._peer.close();
        this._peer = null;
    }
};

PeerConnection.prototype.activateStat = function(interval) {

    if(!this._peer) {
        logger.log(LOG_ID, "Error, can't activate stat. No Peer Connection");
        return;
    }

    var that = this;

    var stat = null;

    if(this._statID === -1) {
        
        this._statID = setInterval(function() {
        
            if (!!navigator.mozGetUserMedia) {
                that._peer.getStats(that._stream.getVideoTracks[0], function(res){

                    stat = statAdapter.firefoxStat(res);

                    logger.log(LOG_ID, "Firefox getStats", stat);

                    that._events.trigger('onStat', stat);

                }, function(error) {
                    console.log("ERROR");
                });
            }
            else {
                that._peer.getStats(function (res) {
                    var items = [];
                    res.result().forEach(function (result) {
                        var item = {};
                        result.names().forEach(function (name) {
                            item[name] = result.stat(name);
                        });
                        item.id = result.id;
                        item.type = result.type;
                        item.timestamp = result.timestamp;
                        items.push(item);
                    });
                    stat = statAdapter.chromeStat(items);

                    logger.log(LOG_ID, "Chrome getStats", stat);

                    that._events.trigger('onStat', stat);
                });    
            }

        }, interval);
    }
};

PeerConnection.prototype.stopStat = function() {
    if(this._statID > -1) {
        clearInterval(this._statID);
    }
};

module.exports = PeerConnection;

