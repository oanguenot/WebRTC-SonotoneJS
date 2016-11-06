var logger = require('sonotone/others/log');

var LOG_ID = 'STAT';

module.exports = {

	chromeStat: function(items) {

		logger.log(LOG_ID, "Chrome Stat", items);		

		var stat = {
			browser: 'chrome',
			OUT_MIC: {
				muted: true,
				description: 'local microphone',
				codec:'',
				inputLevel:0,
				bytesSent: 0,
				packetsLost: 0,
				packetsSent: 0
			},
			IN_MIC: {
				muted: true,
				description: 'remote microphone',
				codec: '',
				outputLevel: 0,
				bytesReceived: 0,
				packetsLost: 0,
				packetsReceived: 0
			},
			OUT_CAM: {
				muted: true,
				description: 'local camera',
				codec:'',
				framerate:0,
				bytesSent: 0,
				packetsLost: 0,
				packetsSent: 0	
			},
			IN_CAM: {
				muted: true,
				description: 'remote camera',
				codec: '',
				framerate: 0,
				bytesReceived: 0,
				packetsLost: 0,
				packetsReceived: 0	
			},
			timestamp : new Date().getTime()
		};

		var item,
		lost = 0;

		for (var i = 0; i<items.length; i++) {
			item = items[i];

			if(item.transportId) {
				// Audio Stat
				if(item.audioInputLevel) {
					// local microphone
					stat.OUT_MIC.codec = item.googCodecName;
					stat.OUT_MIC.inputLevel = parseInt(item.audioInputLevel);
					stat.OUT_MIC.bytesSent = parseInt(item.bytesSent);
					lost = parseInt(item.packetsLost);
					if(lost < 0) {
						lost = 0;
					}
					stat.OUT_MIC.packetsLost = lost;
					stat.OUT_MIC.packetsSent = parseInt(item.packetsSent);
					if(stat.OUT_MIC.inputLevel > 0) {
						stat.OUT_MIC.muted = false;
					}
				} 
				if(item.audioOutputLevel) {
					// remote microphone
					stat.IN_MIC.codec = item.googCodecName;	
					stat.IN_MIC.outputLevel = parseInt(item.audioOutputLevel);	
					stat.IN_MIC.bytesReceived = parseInt(item.bytesReceived);
					lost = parseInt(item.packetsLost);
					if(lost < 0) {
						lost = 0;
					}
					stat.IN_MIC.packetsLost = lost;
					stat.IN_MIC.packetsReceived = parseInt(item.packetsReceived);
					if(stat.IN_MIC.outputLevel > 0) {
						stat.IN_MIC.muted = false;
					}
				}
				// Video Stat
				if(item.googFirsReceived) {
					// local camera					
					stat.OUT_CAM.codec = item.googCodecName || '';
					stat.OUT_CAM.bytesSent = parseInt(item.bytesSent);
					lost = parseInt(item.packetsLost);
					if(lost < 0) {
						lost = 0;
					}
					stat.OUT_CAM.packetsLost = lost;
					stat.OUT_CAM.framerate = parseInt(item.googFrameRateInput);
					stat.OUT_CAM.packetsSent = parseInt(item.packetsSent);
					stat.OUT_CAM.muted = false;
				}
				if(item.googFirsSent) {
					// remove camera
					stat.IN_CAM.codec = item.googCodecName || '';
					stat.IN_CAM.bytesReceived = parseInt(item.bytesReceived);
					if(lost < 0) {
						lost = 0;
					}
					stat.IN_CAM.packetsLost = lost;
					stat.IN_CAM.packetsReceived = parseInt(item.packetsReceived);
					stat.IN_CAM.framerate = parseInt(item.googFrameRateOutput);
					stat.IN_CAM.muted = false;
				}
			}
		}

		return (stat);
	},

	firefoxStat: function(items) {

		logger.log(LOG_ID, "Firefox Stat", items);

		var stat = {
			browser: 'firefox',
			OUT_MIC: {
				muted: false,
				description: 'local microphone',
				codec:'',
				inputLevel:0,
				bytesSent: 0,
				packetsLost:0,
				packetsSent: 0
			},
			IN_MIC: {
				muted: false,
				description: 'remote microphone',
				codec: '',
				outputLevel: 0,
				bytesReceived: 0,
				packetsLost: 0,
				packetsReceived: 0
			},
			OUT_CAM: {
				muted: false,
				description: 'local camera',
				codec:'',
				framerate:0,
				bytesSent: 0,
				packetsLost: 0,
				packetsSent: 0
			},
			IN_CAM: {
				muted: false,
				description: 'remote camera',
				codec: '',
				framerate: 0,
				bytesReceived: 0,
				packetsLost: 0,
				packetsReceived: 0
			},
			timestamp : new Date().getTime()
		};

		stat.IN_MIC.bytesReceived = items.inbound_rtp_audio_1.bytesReceived;
		stat.IN_MIC.packetsReceived = items.inbound_rtp_audio_1.packetsReceived;
		stat.IN_MIC.packetsLost = items.inbound_rtp_audio_1.packetsLost;

		if("outbound_rtp_audio_-1" in items) {
			stat.OUT_MIC.bytesSent = items["outbound_rtp_audio_-1"].bytesSent;
			stat.OUT_MIC.packetsLost = items["outbound_rtp_audio_-1"].packetsLost || 0;			
		}
		else {
			logger.log(LOG_ID, "No outbound info for audio");
		}

		if("inbound_rtp_video_2" in items) {
			stat.IN_CAM.bytesReceived = items.inbound_rtp_video_2.bytesReceived;
			stat.IN_CAM.packetsReceived = items.inbound_rtp_video_2.packetsReceived;
			stat.IN_CAM.packetsLost = items.inbound_rtp_video_2.packetsLost;	
			stat.IN_CAM.framerate = Math.floor(items.inbound_rtp_video_2.framerateMean);
		}
		else {
			logger.log(LOG_ID, "No inbound info for video");	
		}

		if("outbound_rtp_video_-1" in items) {
			stat.OUT_CAM.bytesSent = items["outbound_rtp_video_-1"].bytesSent;
			stat.OUT_CAM.packetsLost = items["outbound_rtp_video_-1"].packetsLost || 0;		
		}
		else {
			logger.log(LOG_ID, "No Outbound info for video");	
		}
		

		return (stat);	
	}


};
