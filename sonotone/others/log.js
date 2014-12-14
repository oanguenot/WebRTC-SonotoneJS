 var COLOR = {
    "SONOTONE.IO": "orange",
    "LOCALMEDIA": "blue",
    "WEBSOCKET": 'green',
    "PEERCONNECTION": 'Maroon',
    "REMOTEMEDIA": "MediumPurple",
    "TODO": "cyan",
    "DATACHANNEL": "Crimson",
    "CAPABILITIES": "black",
    "STREAM": "grey",
    "CONFIG": 'black',
    "PEER": 'chocolate',
    "SOURCE": 'black',
    "STAT": "black" 
};

var DEBUG = true;


function _log(category, message, arg) {
    var time = new Date(),
    ms = time.getMilliseconds();

    if(ms < 10) {
        ms = '00' + ms;
    } else if (ms < 100) {
        ms = '0' + ms;
    }

    var displaycat = category.substring(0, 12);
    while(displaycat.length < 12) {
        displaycat += ' ';
    }

    if(arg !== undefined) {
        console.log("%c|'O~O'| " + time.toLocaleTimeString() + ":" + ms + " [" + displaycat + "]   " + message + " | %O", "color:" + COLOR[category], arg);
    }
    else {
        console.log("%c|'O~O'| " + time.toLocaleTimeString() + ":" + ms + " [" + displaycat + "]   " + message, "color:" + COLOR[category]);   
    }
}

module.exports = {

    log: function(category, message, arg) {
        if (DEBUG) {
            _log(category, message, arg);                
        }
    },

    activateLog: function() {
        DEBUG = true;
    },

    unactivateLog: function() {
        DEBUG = false;
    },

    isLogActivated: function() {
        return DEBUG;
    }
};