
var LOG_ID = 'CONFIG';

var logger = require('sonotone/others/log');

var turn = {
    url: 'turn:numb.viagenie.ca',
    username: 'olivier.anguenot@free.fr',
    credential: 'jabbah75'
};

var stun = {
    url: "stun:stun.l.google.com:19302"
};



var useSTUNServer = false,
    useTURNServer = false;

logger.log(LOG_ID, 'Module started...');
logger.log(LOG_ID, 'No TURN AND STUN configuration by default');


module.exports = {

    /**
     * Get/Set the STUN server to use
     * @param {Object} stunServer The server(s) to use
     */

    STUN: function(stunServer) {
        if(stunServer) {
            logger.log(LOG_ID, 'Configure STUN', stunServer);
            stun = stunServer;
        }
        return stun;
    },

    /**
     * Get/Set the TURN server to use
     * @param {Object} turnServer The server(s) to use
     */ 

    TURN: function(turnServer) {
        if(turnServer) {
            logger.log(LOG_ID, 'Configure TURN', turnServer);
            turn = turnServer;  
        }
        return turn;
    },

    /**
     * Choose to use or not the stun configuration
     * @param {Boolean} use True to use the stun configuration defined
     */

    useSTUN: function(use) {
        if(use) {
            logger.log(LOG_ID, 'STUN activated', stun); 
        } else {
            logger.log(LOG_ID, 'STUN deactivated', stun);
        }
        useSTUNServer = use;
    },

    /**
     * Choose to use or not the TURN configuration
     * @param {Boolean} use True to use the stun configuration defined
     */

    useTURN: function(use) {
        if(use) {
            logger.log(LOG_ID, 'TURN activated', turn);
        }
        else {
            logger.log(LOG_ID, 'TURN deactivated', turn);
        }
        useTURNServer = use;
    },

    /**
     * Return true if the STUN configuration is used
     */

    isSTUNUsed: function() {
        return useSTUNServer;
    },

    /**
     * Return true if the TURN configuration is used
     */

    isTURNUsed: function() {
        return useTURNServer;
    },

    /**
     * Get the STUN configuration to use accordingly to settings
     */

    getSTUNConfiguration: function() {
        if(useSTUNServer) {
            return stun;
        }
        else {
            return null;
        }
    },

    /**
     * Get the TURN configuration to use accordingly to settings
     */

    getTURNConfiguration: function() {
        if(useTURNServer) {
            return turn;
        }
        else {
            return null;
        }
    },

    getICEConfiguration: function() {

        if(useSTUNServer && useTURNServer) {
            return {"iceServers": [stun, turn]};
        }
        else if(useTURNServer) {
            return {"iceServers": [turn]};
        } 
        else if( useSTUNServer) {
             return {"iceServers": [stun]};
        }
        else {
            return {"iceServers": []};
        }
    }
};