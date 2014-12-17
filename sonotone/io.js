var VERSION = "1.0.1";

var LOG_ID = 'SONOTONE.IO';

var logger = require('sonotone/others/log');

logger.log(LOG_ID, 'Welcome to Sonotone!');
logger.log(LOG_ID, 'Running v' + VERSION);

logger.log(LOG_ID, "Module started...");

var config = require('sonotone/others/configuration'),
    localMedia = require('sonotone/stream/localMedia'),
    Events = require('sonotone/others/event'),
    Capabilities = require('sonotone/others/capabilities'),
    Peer = require('sonotone/others/peer'),
    sources = require('sonotone/stream/source'),
    sdp = require('sonotone/others/sdp');

var users = {};

var peers = {};

var events = new Events();

var transportLayer = null;

var tmp_offer = {};

config.useSTUN(true);
config.useTURN(true);

var onMessage = function onMessage(msg) {

    var json = null;
    var peer = null;

    switch (msg.data.type) {
        case 'join':
            peer = new Peer(msg.caller);
            subscribePeerEvents(peer);
            peer.caps(msg.data.caps);
            users[msg.caller] = peer;
            peers[msg.caller] = peer;
            logger.log(LOG_ID, "</-- onPeerConnected", peer);
            events.trigger('onPeerConnected', peer);
            break;
         case 'already_joined':
            peer = new Peer(msg.caller);
            subscribePeerEvents(peer);
            peer.caps(msg.data.caps);
            peers[msg.caller] = peer;
            users[msg.caller] = peer;
            logger.log(LOG_ID, "</-- onPeerAlreadyConnected", peer);
            events.trigger('onPeerAlreadyConnected', peer);
            break;
        case 'exited':
            var old = users[msg.caller];
            unsubscribePeerEvents(old);
            //delete users[msg.caller];
            delete(peers[msg.caller]);
            logger.log(LOG_ID, "</-- onPeerDisconnected", old);
            events.trigger('onPeerDisconnected', old);
            break;
        case 'offer':
            tmp_offer[msg.caller] = msg;
            var mediaUsed = sdp.getMediaInSDP(msg.data.sdp);
            logger.log(LOG_ID, "</-- onPeerCallOffered", {id: msg.caller, media: msg.media, type: mediaUsed});
            events.trigger('onPeerCallOffered', {id: msg.caller, media: msg.media, type: mediaUsed});
            break;
        case 'answer':
            logger.log(LOG_ID, "</-- onPeerCallAnswered", {id: msg.caller, media: msg.media});
            events.trigger('onPeerCallAnswered', {id: msg.caller, media: msg.media});
            users[msg.caller].setRemoteDescription(msg.media, msg.data);
            break;
        case 'candidate':
            peer = users[msg.caller];
            peer.addCandidate(msg.media, msg.data);
            break;
        case 'iq_result':
                json = {id: msg.data.id, value: msg.data.value, selector: msg.data.selector}; 
                logger.log(LOG_ID, "</-- onIQResult", json);
                events.trigger('onIQResult', json);    
            break;
        case 'im':
            json = {id: msg.caller, content: msg.data.content, private: msg.data.private};
            logger.log(LOG_ID, "</-- onPeerIMMessage", json);
            events.trigger('onPeerIMMessage', json);
            break;
        case 'poke':
            json = {id: msg.caller, content: msg.data.content, private: msg.data.private};
            logger.log(LOG_ID, "</-- onPeerPokeMessage", json);
            events.trigger('onPeerPokeMessage', json);
            break;
        case 'bye':
            json = {id: msg.caller, media: msg.media};
            logger.log(LOG_ID, "</-- onPeerEndCall", json);
            events.trigger('onPeerEndCall', json);
            break;
        case 'ack':
            //todo: what to do with this server ack
            events.trigger('onAck', null);    
            break;
        case 'join_ack':
            events.trigger('onJoinAck', null);
            break;
        case 'exit_ack': 
            events.trigger('onExitAck', null);
            break;
        default:
            logger.log(LOG_ID, "!!!Warning, message not handled", msg.data.type);
            break;
    }
};

var onUnknownMessage = function onUnknownMessage(msg) {
    logger.log(LOG_ID, "Incoming unknown message: " + msg);
};

var onTransportReady = function onTransportReady() {
    logger.log(LOG_ID, "Transport successfully connected");

    // Automatically call the welcome function of the transport
    transportLayer.welcome();
};

var onTransportClosed = function onTransportClosed() {
    logger.log(LOG_ID, "Transport closed");
};

var onTransportError = function onTransportError(err) {
    logger.log(LOG_ID, "Received from Transport: " + err);
};

var subscribeTransportEvents = function subscribeTransportEvents() {
    transportLayer.on('onTransportReady', onTransportReady, this);
    transportLayer.on('onTransportMessage', onMessage, this);
    transportLayer.on('onTransportUnknownMessage', onUnknownMessage,this);
    transportLayer.on('onTransportClosed', onTransportClosed, this);
    transportLayer.on('onTransportError', onTransportError, this);
};

var unsubscribeTransportEvents = function unsubscribeTransportEvents() {
    transportLayer.off('onTransportReady', onTransportReady);
    transportLayer.off('onTransportMessage', onMessage);
    transportLayer.off('onTransportUnknownMessage', onUnknownMessage);
    transportLayer.off('onTransportClosed', onTransportClosed);
    transportLayer.off('onTransportError', onTransportError);
};

var onSDPOfferToSend = function onSDPOfferToSend(event) {
    transportLayer.send(event);
};

var onSDPAnswerToSend = function onSDPAnswerToSend(event) {
    transportLayer.send(event);  
};

var onICECandiateReceived = function onICECandiateReceived(event) {
    transportLayer.send(event);
};

var onICECompleted = function onICECompleted(event) {
    events.trigger('onPeerICECompleted', event);    
};

var onICEConnected = function onICECompleted(event) {
    events.trigger('onPeerICEConnected', event);    
};

var onICEFailed = function onICECompleted(event) {
    events.trigger('onPeerICEFailed', event);    
};

var onICEClosed = function onICECompleted(event) {
    events.trigger('onPeerICEClosed', event);    
};

var onICEDisconnected = function onICECompleted(event) {
    events.trigger('onPeerICEDisconnected', event);    
};

var onSDPLocalMediaUsed = function onSDPLocalMediaUsed(event) {
    events.trigger('onPeerSDPLocalMediaUsed', event);
};

var onSDPRemoteMediaUsed = function onSDPRemoteMediaUsed(event) {
    events.trigger('onPeerSDPRemoteMediaUsed', event);
};

var onSDPCodecsNegotiated = function onSDPCodecsNegociated(event) {
    events.trigger('onPeerSDPCodecsNegotiated', event);
};

var onRemoteVideoStreamStarted = function onRemoteVideoStreamStarted(event) {
    logger.log(LOG_ID, "</-- onPeerCallVideoStarted", event);
    events.trigger('onPeerCallVideoStarted', event);  
};

var onRemoteVideoStreamEnded = function onRemoteVideoStreamEnded(event) {
    logger.log(LOG_ID, "</-- onPeerCallVideoEnded", event);
    events.trigger('onPeerCallVideoEnded', event);  
};

var onRemoteScreenStreamStarted = function onRemoteScreenStreamStarted(event) {
    logger.log(LOG_ID, "</-- onPeerCallScreenStarted", event);
    events.trigger('onPeerCallScreenStarted', event);  
};

var onStatReceived = function onStatReceived(event) {
    logger.log(LOG_ID, "</-- onPeerStatReceived", event);
    events.trigger('onPeerStatReceived', event);    
};

var subscribePeerEvents = function subscribePeerEvents(peer) {
    peer.on('onSDPOfferToSend', onSDPOfferToSend, this);
    peer.on('onSDPAnswerToSend', onSDPAnswerToSend, this);
    peer.on('onSDPLocalMediaUsed', onSDPLocalMediaUsed, this);
    peer.on('onSDPRemoteMediaUsed', onSDPRemoteMediaUsed, this);
    peer.on('onSDPCodecsNegotiated', onSDPCodecsNegotiated, this);
    peer.on('onICECandiateReceived', onICECandiateReceived, this);
    peer.on('onICEConnected', onICEConnected, this);
    peer.on('onICECompleted', onICECompleted, this);
    peer.on('onICEFailed', onICEFailed, this);
    peer.on('onICEClosed', onICEClosed, this);
    peer.on('onICEDisconnected', onICEDisconnected, this);
    peer.on('onRemoteVideoStreamStarted', onRemoteVideoStreamStarted, this);
    peer.on('onRemoteVideoStreamEnded', onRemoteVideoStreamEnded, this);
    peer.on('onRemoteScreenStreamStarted', onRemoteScreenStreamStarted, this);
    peer.on('onStat', onStatReceived, this);
};

var unsubscribePeerEvents = function unsubscribePeerEvents(peer) {
    peer.off('onSDPOfferToSend', onSDPOfferToSend);
    peer.off('onSDPAnswerToSend', onSDPAnswerToSend);
    peer.off('onSDPLocalMediaUsed', onSDPLocalMediaUsed);
    peer.off('onSDPRemoteMediaUsed', onSDPRemoteMediaUsed);
    peer.off('onSDPCodecsNegotiated', onSDPCodecsNegotiated);
    peer.off('onICECandiateReceived', onICECandiateReceived);
    peer.off('onICEConnected', onICEConnected);
    peer.off('onICECompleted', onICECompleted);
    peer.off('onICEFailed', onICEFailed);
    peer.off('onICEClosed', onICEClosed);
    peer.off('onICEDisconnected', onICEDisconnected);
    peer.off('onRemoteVideoStreamStarted', onRemoteVideoStreamStarted);
    peer.off('onRemoteVideoStreamEnded', onRemoteVideoStreamEnded);
    peer.off('onRemoteScreenStreamStarted', onRemoteScreenStreamStarted);  
    peer.off('onStat', onStatReceived);
};

module.exports = {

    /**
     * Set the Sonotone ID
     * @param {JSON} caps the user capabilities
     */
    setIdentity: function(caps) {
        Capabilities.setID(caps.id);
        Capabilities.userName(caps.username);
    },

    localMedia: function() {
        return localMedia;
    },

    remoteMedia: function(userid, media) {
        return users[userid].getRemoteStream(media);
    },

    sources: function() {
        return sources;
    },

    /**
     * Get or set the transport
     * @param {String} name The transport name
     * @param {Object} config The JSON Configuration of the transport
     * @return {Object} the Sonotone.IO.<xxx>Transport Object
     *
     * @api public
     */

    transport: function(name) {

        if(name !== undefined) {

            switch (name) {
                case "websocket":
                    transportLayer = require('./transport/websocket');
                    break;
                case "sip":
                     //transportLayer = new Sonotone.IO.SIPTransport(config);
                    break;
                case "remote":
                    //transportLayer = new Sonotone.IO.RemoteTransport(config);
                    break;
                default:
                    transportLayer = null;
                    break;
            }

            if(transportLayer) {
                subscribeTransportEvents(); 
            }
            else {
                logger.log(LOG_ID, '!!!ERROR, unknown transport');
            }
        }

        return transportLayer;
    },

    /**
     * Define a transport
     * For testing purpose today
     * @param {Object} transport The transport to set
     */

    setTransport: function(transport) {
        transportLayer = transport;
    },

    /**
     * Get the transport
     * For testing purpose today
     */

    getTransport: function() {
        return transportLayer;
    },

    endTransport: function() {
        unsubscribeTransportEvents();
    },

    /**
     * Send a message thu the transport
     * @param {String} msg The content to send
     * @param {String} to The recipient or all for broadcasting a message to all peer
     *
     * @api public
     */

    sendIMMessage: function(msg, to) {

        if(transportLayer) {

            var recipient = to || 'all';

            logger.log(LOG_ID, "Try to send an IM to", recipient);

            var message = {
                data: {
                    type: 'im',
                    content: msg,
                    private: (recipient !=='all')  ? true: false
                },
                caller: Capabilities.ID(),
                callee: recipient
            };

            transportLayer.send(message);
            return 0;
        }
        else {
            logger.log(LOG_ID, '!!!ERROR, no transport');
            return -1;
        }
    },

    /**
     * Send a poke thru the transport
     * @param {String} to The recipient or all for broadcasting a message to all peer
     * @param {string} type The different type of poke
     *
     * @api public
     */

    poke: function(to, type) {
        if(transportLayer) {
            var recipient = to || 'all';

            logger.log(LOG_ID, "Try to send a Poke <" + type + "> to", recipient);

            var message = {
                data: {
                    type: 'poke',
                    private: (recipient !=='all')  ? true: false,
                    content: type
                },
                caller: Capabilities.ID(),
                callee: recipient
            };

            transportLayer.send(message);
            return 0;
        }
        else {
            logger.log(LOG_ID, '!!!ERROR, no transport');
            return -1;
        }
    },

    /**
     * Query the server to check if a user is connected or not
     *
     * @api public
     */

    queryConnected: function(id) {
        if(transportLayer) {
            logger.log(LOG_ID, "IQ Connected", id);

            var message = {
                data: {
                    type: 'iq',
                    selector: 'connected',
                    id: id 
                },
                caller: Capabilities.ID(),
                callee: null
            };

            transportLayer.send(message);
            return 0;
        }
        else {
           logger.log(LOG_ID, '!!!ERROR, no transport');
            return -1; 
        }
    },

    /**
     * Try to call an other peer
     * @param {String} callee The recipient ID
     * @param {String} media 'video', 'screen', 'data' or 'video' if null
     * @param {Object} constraints that contains
     * @param {String} audioCodec 'g711', 'opus' or default order of browser if null
     * @param {String} videoCodec 'vp8' or 'h264' or default order of browser if null
     * @param {Number} audioBandwidth   The max bandwidth for audio
     * @param {Number} videoBandwidth   The max bandwidth for video 
     *
     * @api public
     */

    call: function(callee, media, constraints) {

        media = media || 'video';

        var peer = users[callee];

        if(peer) {
            // If no tmp_offer for that peer = call
            // if tmp_offer for that peer = answer
            peer.call(media, tmp_offer[callee], constraints);
            delete tmp_offer[callee];
        }
        else {
            return -1;
        }
    },

    endCall: function(callee, media) {

        media = media || 'video';

        var peer = users[callee];

        if(peer) {
            peer.endCall(media);
            // delete users[callee];
            // peer = null;
        }
        else {
            return -1;
        }
    },

    /**
     * Get the list of peers
     */

    peers: function() {
        return users;
    },

    /**
     * Get the number of peers
     */

    numberOfPeers: function() {
        return Object.keys(peers).length;
    },

    startStat: function(callee, media, interval) {
        media = media || 'video';
        interval = interval || 5000;

        var peer = users[callee];

        if(peer) {
            peer.startStat(media, interval);
        }
    },

    stopStat: function(callee, media) {
        media = media || 'video';

        var peer = users[callee];

        if(peer) {
            peer.stopStat(media);
        }  
    },

    /**
     * Subscribe to IO events
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

    /**
     * Test only
     */
     
    _onMessage: function(msg) {
        onMessage(msg);
    }
};