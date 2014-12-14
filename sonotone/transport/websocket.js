
var LOG_ID = 'WEBSOCKET';

var logger = require('../others/log');
var Events = require('../others/event');
var capabilities = require('../others/capabilities');

var protocol = 'ws://';

var socket = null;

var room = null;

var caps = capabilities.caps();
var events = new Events();

var transportReady = false;

var onOpen = function onOpen() {
    logger.log(LOG_ID, "<--- OK");
    transportReady = true;
    logger.log(LOG_ID, "</-- onTransportReady", null);
    events.trigger('onTransportReady', null);
};

var onMessage = function onMessage(msg) {

    var message = null;

    var unknownMessage = false;

    if(msg.data && typeof msg.data === 'string') {

        try {
            message = JSON.parse(msg.data);  
            if(message.data && message.data.type) {
                logger.log(LOG_ID, "<--- " + message.data.type, message);
                events.trigger('onTransportMessage', message);    
            }  
            else {
                unknownMessage = true;
            }
        }
        catch (err) {
            logger.log(LOG_ID, "Error", err);
            unknownMessage = true;
        }
    }
    else {
        unknownMessage = true;
    }

    if(unknownMessage) {
        logger.log(LOG_ID, "</-- onTransportUnknownMessage", msg);
        events.trigger('onTransportUnknownMessage', msg);
    }
};

var onClosed = function onClosed() {
    logger.log(LOG_ID, "<--- !!!Warning, Channel Closed");
    transportReady = false;
    logger.log(LOG_ID, "</-- onTransportClosed", null);
    events.trigger('onTransportClosed', null);
};

var onError = function onError(err) {
    logger.log(LOG_ID, "<--- !!!Error, error message received");
    transportReady = false;
    logger.log(LOG_ID, "</-- onTransportError", null);
    events.trigger('onTransportError', err);
};

logger.log(LOG_ID, "Module started...");

module.exports = {

    /**
     * Transport type
     */

    name: function() {
        return "websocket";
    },

    /**
     * Connect the Transport
     * @param {Object} config The server configuration (host, port)
     * @param {Object} data The user capabilities that have to be transmitted to others peers (nickname, audio/video capabilities...)
     * @param {String} code, The conference code (room)
     *
     * @api public
     */

    connect: function(config) {

        if(config && config.host) {
            logger.log(LOG_ID, "---> Connect", config);

            if(config.secure) {
                protocol = 'wss://';
            }

            if(!socket) {
            
                if(config.port) {
                    socket = new WebSocket(protocol + config.host + ":" + config.port);
                }
                else {
                    socket = new WebSocket(protocol + config.host);
                }

                socket.onopen = function(msg) {
                    onOpen(msg);
                };

                socket.onmessage = function(msg) {
                    onMessage(msg);
                };

                socket.onclose = function() {
                    onClosed();
                };

                socket.onerror = function(err) {
                    onError(err);
                };
            }
        }
        else {
            logger.log(LOG_ID, "No server configuration. Connection aborded");
            events.trigger('onTransportError', null);
        }
    },

    /**
     * Send a message using the Transport
     *
     * @api public
     */

    send: function(JSONMessage) {
        if(transportReady) {
            if(room) {
                JSONMessage.room = room;    
            }
            var message = JSON.stringify(JSONMessage);
            logger.log(LOG_ID, "---> " + JSONMessage.data.type, JSONMessage);
            socket.send(message);
        }
        else {
             logger.log(LOG_ID, "Not ready!!!", JSONMessage);
        }
    },

    /**
     * Send a welcome message to the server
     *
     * @api privte
     */

    welcome: function() {
        this.send(
            {
                data: {
                    type: 'welcome',
                },
                caller: capabilities.ID(), 
                callee: 'all',
            }
        );
    },

    /**
     * Send a bye message to the server
     */

    bye: function() {
        this.send({
            data: {
                type: 'bye',
            },
            caller: capabilities.ID(),
            callee: 'all'
        });

        transportReady = false;
        socket.close();
        socket = null;
    },

    /**
     * Join a room for discussing
     * Should be the first call to the server (user capabilities)
     *
     * @api public
     */

    join: function(roomID) {

        room = roomID;

        this.send({
            data: {
                type: 'join',
                caps: caps,
                room: roomID,
            },
            caller: capabilities.ID(), 
            callee: 'all',
        });
    },

    /**
     * Exit a current room
     *
     * @api public
     */

    exit: function() {

        if(room) {
            this.send({
                data: {
                    type:'exit',
                    room: room
                },
                caller: capabilities.ID(),
                callee: 'all'
            });
        }
    },

    /**
     * Subscribe to Websocket events
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
     * Unsubscribe to Websockets events
     * @param {String} eventName The event to unsubscribe
     * @param {Function} callbackFunction The registered callback
     *
     * @api public
     */    

    off: function(eventName, callbackFunction) {
        events.off(eventName, callbackFunction);
    },

    isReady: function() {
        return transportReady;
    },

    /** 
     * Testing purpose only
     *
     * @api private
     */
    _onOpen: function() {
        onOpen();
    },

    /** 
     * Testing purpose only
     *
     * @api private
     */
    _onMessage: function(msg) {
        onMessage(msg);
    },

    /** 
     * Testing purpose only
     *
     * @api private
     */
    _onClosed: function() {
        onClosed();
    },

    /** 
     * Testing purpose only
     *
     * @api private
     */
    _onError: function(err) {
        onError(err);
    }


};