var logger = require('../others/log'),
    Events = require('../others/event');

var LOG_ID = 'SOURCE';

logger.log(LOG_ID, "Module started...");

module.exports = {

    getAudioSources: function(callback, context) {

        logger.log(LOG_ID, "Try to get the list of Audio sources");

        if (typeof MediaStreamTrack === 'undefined' || typeof MediaStreamTrack.getSources === 'undefined') {
            logger.log(LOG_ID, "No access to audio sources. Use default");
            callback.call(context, []);
        }
        else {
            MediaStreamTrack.getSources(function(sourceInfos) {
            
                var sources = [];
                logger.log(LOG_ID, "Sources found", sourceInfos);

                for (var i = 0; i !== sourceInfos.length; ++i) {
                    var sourceInfo = sourceInfos[i];
                    if (sourceInfo.kind === 'audio') {
                        sources.push({id: sourceInfos[i].id, label: sourceInfos[i].label});
                    }
                }
                
                logger.log(LOG_ID, "Audio sources found", sources);

                callback.call(context, sources);
            });    
        }
    },

    getVideoSources: function(callback, context) {

        logger.log(LOG_ID, "Try to get the list of Video sources");

        if (typeof MediaStreamTrack === 'undefined' || typeof MediaStreamTrack.getSources === 'undefined') {
            logger.log(LOG_ID, "No access to video sources. Use default");
            callback.call(context, []);
        }
        else {
            MediaStreamTrack.getSources(function(sourceInfos) {
            
                var sources = [];
                logger.log(LOG_ID, "Sources found", sourceInfos);

                for (var i = 0; i !== sourceInfos.length; ++i) {
                    var sourceInfo = sourceInfos[i];
                    if (sourceInfo.kind === 'video') {
                        sources.push({id: sourceInfos[i].id, label: sourceInfos[i].label});
                    }
                }
                
                logger.log(LOG_ID, "Video sources found", sources);

                callback.call(context, sources);
            });    
        }
    },

};