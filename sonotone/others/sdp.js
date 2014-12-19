
var forceCodecTo = function forceCodecTo(sdp, codecToForce, media) {

    var splittedSDP = sdp.split('\r\n'),
        indexVideo = -1,
        indexPos = -1,
        codec = [],
        list = [],
        from, to, codecName, indexFound, j,
        codecList = {};

    for (var i = 0, l = splittedSDP.length; i < l; i++) {

        var line = splittedSDP[i];

        if(line.indexOf('m=' + media) > -1) {
            indexVideo = i;
            indexPos = line.indexOf('RTP/SAVPF') + 10; 
            list = line.substring(indexPos).split(" ");
        }

        if(line.indexOf(codecToForce) >-1 ) {
            from = line.indexOf(':');
            to = line.indexOf(' ');
            codecName = line.substring(from + 1, to);
            indexFound = -1;
            codec.push(codecName);
            //Remove from list
            for(j = 0; j < list.length; j++) {
                if(list[j] === codecName) {
                    indexFound = j;
                    break;
                }
            }
            if(indexFound > -1) {
                list.splice(indexFound, 1);
            }
        }

        if(codecToForce === 'PCMU/8000') {
            // Do it again with the second codec
            if(line.indexOf('PCMA/8000') >-1 ) {
                from = line.indexOf(':');
                to = line.indexOf(' ');
                codecName = line.substring(from + 1, to);
                indexFound = -1;
                codec.push(codecName);
                //Remove from list
                for(j = 0; j < list.length; j++) {
                    if(list[j] === codecName) {
                        indexFound = j;
                        break;
                    }
                }
                if(indexFound > -1) {
                    list.splice(indexFound, 1);
                }
            }
        }
    }

    splittedSDP[indexVideo] = splittedSDP[indexVideo].substr(0, indexPos-1);
    // Add  requested codec first
    for (var k = 0; k < codec.length; k++) {
        splittedSDP[indexVideo] += " " + codec[k];
    }

    if(list.length > 0) {
        splittedSDP[indexVideo] += " " + list.join(' ');    
    }

    sdp = splittedSDP.join('\r\n');

    return sdp;
};

// Find the line in sdpLines that starts with |prefix|, and, if specified,
// contains |substr| (case-insensitive search).
// https://github.com/muaz-khan/RTCMultiConnection/wiki/Bandwidth-Management
var findLine = function findLine(sdpLines, prefix, substr) {
    return findLineInRange(sdpLines, 0, -1, prefix, substr);
};

// Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
// and, if specified, contains |substr| (case-insensitive search).
// https://github.com/muaz-khan/RTCMultiConnection/wiki/Bandwidth-Management
var findLineInRange = function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
    var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
    for (var i = startLine; i < realEndLine; ++i) {
        if (sdpLines[i].indexOf(prefix) === 0) {
            if (!substr ||
                sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                return i;
            }
        }
    }
    return null;
}

// Gets the codec payload type from an a=rtpmap:X line.
// https://github.com/muaz-khan/RTCMultiConnection/wiki/Bandwidth-Management
var getCodecPayloadType = function getCodecPayloadType(sdpLine) {
    var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
    var result = sdpLine.match(pattern);
    return (result && result.length === 2) ? result[1] : null;
};

module.exports = {

    forceVideoCodecTo: function(sdp, codecToForce) {
        return (forceCodecTo(sdp, codecToForce, 'video'));
    },

    forceAudioCodecTo: function(sdp, codecToForce) {
        return (forceCodecTo(sdp, codecToForce, 'audio'));
    },

    getFirstAudioCodec: function(sdp) {

        var indexAudio = -1,
            beginAudioTags = -1,
            tags = null,
            codecNumber = '',
            audioCodec = 'Unknown';

        var line, i;

        if(sdp.length > 0) {
            var splittedSDP = sdp.split('\r\n');

            for (i = 0, l = splittedSDP.length; i < l; i++) {

                line = splittedSDP[i];

                if(line.indexOf('m=audio') > -1) {
                       
                    indexAudio = i;
                    beginAudioTags = line.indexOf('RTP/SAVPF') + 10;
                    tags = line.substr(beginAudioTags).split(" ");

                    if(tags && tags.length > 0) {
                        codecNumber = tags[0];    
                    }
                    else {
                        codecNumber = '';
                    }
                }
                if(line.indexOf('a=rtpmap:') >-1 ) {
                    var number = line.substring(9, line.indexOf(' '));
                    if(number === codecNumber) {
                        audioCodec = line.substring(line.indexOf(' ') + 1);
                    }
                }
            }
        }
        return audioCodec;
    },

    getFirstVideoCodec: function(sdp) {

        var indexAudio = -1,
            beginAudioTags = -1,
            tags = null,
            codecNumber = '',
            videoCodec = 'Unknown';

        var line, i;

        if(sdp.length > 0) {
            var splittedSDP = sdp.split('\r\n');

            for (i = 0, l = splittedSDP.length; i < l; i++) {

                line = splittedSDP[i];

                if(line.indexOf('m=video') > -1) {
                       
                    indexAudio = i;
                    beginAudioTags = line.indexOf('RTP/SAVPF') + 10;
                    tags = line.substr(beginAudioTags).split(" ");

                    if(tags && tags.length > 0) {
                        codecNumber = tags[0];    
                    }
                    else {
                        codecNumber = '';
                    }
                }
                if(line.indexOf('a=rtpmap:') >-1 ) {
                    var number = line.substring(9, line.indexOf(' '));
                    if(number === codecNumber) {
                        videoCodec = line.substring(line.indexOf(' ') + 1);
                    }
                }
            }
        }
        return videoCodec;
    },

    getMediaInSDP: function(sdp) {

        var media = 'no';
        var current='audio';
        var hasAudio = false,
            hasVideo = false;

        var splittedSDP = sdp.split('\r\n');
        for(var i=0; i < splittedSDP.length; i++) {
            var line = splittedSDP[i];
            if(line.indexOf('m=audio') > -1) {
                current = 'audio';
            }
            if(line.indexOf('m=video') > -1) {
                current = 'video';
            }
            if(line.indexOf('sendrecv')  > -1 || line.indexOf('sendonly') > -1) {
                if(current === 'audio') {
                    hasAudio = true;
                } else {
                    hasVideo = true;
                }
            }
        }

        if(hasAudio && hasVideo) {
            media = 'full';
        }
        else {
            if(hasAudio) {
                media = 'audio';
            }
            else if( hasVideo) {
                media = 'video';
            }
            else {
                media = 'no';
            }
        }

        return media;
    },

    addFECSupport: function(sdp) {

        // https://github.com/muaz-khan/RTCMultiConnection/wiki/Bandwidth-Management
        var sdpLines = sdp.split('\r\n');

        // Find opus payload.
        var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
        var opusPayload;
        if (opusIndex) {
            opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
        }

        // Find the payload in fmtp line.
        var fmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
        if (fmtpLineIndex === null) {
            return sdp;
        }

        // Append stereo=1 to fmtp line.
        // added maxaveragebitrate here; about 128 kbits/s
        // added stereo=1 here for stereo audio
        sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat('; useinbandfec=1');

        sdp = sdpLines.join('\r\n');

        return sdp;
    },

    addStereoSupport: function(sdp) {

        // https://github.com/muaz-khan/RTCMultiConnection/wiki/Bandwidth-Management
        var sdpLines = sdp.split('\r\n');

        // Find opus payload.
        var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
        var opusPayload;
        if (opusIndex) {
            opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
        }

        // Find the payload in fmtp line.
        var fmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
        if (fmtpLineIndex === null) {
            return sdp;
        }

        // Append stereo=1 to fmtp line.
        // added maxaveragebitrate here; about 128 kbits/s
        // added stereo=1 here for stereo audio
        sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat('; stereo=1; sprop-stereo=1');

        sdp = sdpLines.join('\r\n');

        return sdp;
    },    

    limitAudioBandwidthTo: function(sdp, size) {
         sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + size + '\r\n');
        return sdp;
    },

    limitVideoBandwidthTo: function(sdp, size) {
         sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + size + '\r\n');
        return sdp;
    },    

};