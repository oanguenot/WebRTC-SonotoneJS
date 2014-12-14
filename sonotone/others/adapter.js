var browserName = "Other";
var browserVersion = "unknown";

// Try to detect the navigator used
if(navigator.mozGetUserMedia && window.mozRTCPeerConnection) {
	browserName = "Firefox";
}
else if (navigator.webkitGetUserMedia && window.webkitRTCPeerConnection) {
	browserName = "Chrome";
}

module.exports = {

	browserName: function() {
		return browserName;
	},

	/**
	 * GetUserMedia
	 * Compliant Firefox/Chrome
	 */

	getUserMedia: function(constraints, callback, errCallback, context) {

		if(browserName === 'Chrome') {
			return navigator.webkitGetUserMedia.bind(navigator).call(context, constraints, callback, errCallback);
		}
		else if(browserName === 'Firefox') {
			return navigator.mozGetUserMedia.bind(navigator).call(context, constraints, callback, errCallback, context);
		}
		else {
			return null;
		}
	},

	/**
	 * GetVideoTracks
	 * Compliant Firefox/Chrome
	 */

	getVideoTracks: function(mediaStream) {

		if(browserName === 'Chrome') {
			if(typeof mediaStream.getVideoTracks === 'function') {
				return mediaStream.getVideoTracks();	
			}
			else {
				return [];
			}
			
		}
		else if(browserName === 'Firefox') {
			if(typeof mediaStream.getVideoTracks === 'function') {
				return mediaStream.getVideoTracks();
			}
			else {
				return [];
			}
		}
		else {
			return [];
		}
	},

	/**
	 * GetAudioTracks
	 * Compliant Firefox/Chrome
	 */

	getAudioTracks: function(mediaStream) {

		if(browserName === 'Chrome') {
			if(typeof mediaStream.getVideoTracks === 'function') {
				return mediaStream.getAudioTracks();
			}
			else {
				return [];
			}
		}
		else if(browserName === 'Firefox') {
			if(typeof mediaStream.getVideoTracks === 'function') {
				return mediaStream.getAudioTracks();
			}
			else {
				return [];
			}
		}
		else {
			return [];
		}
	},

	/**
	 * AttachToMEdia
	 * COmpliant Firefox/Chrome
	 */

	attachToMedia: function(element, stream) {
		if(browserName === 'Chrome') {
			if (typeof element.srcObject !== 'undefined') {
                element.srcObject = stream;
            } else if (typeof element.mozSrcObject !== 'undefined') {
                element.mozSrcObject = stream;
            } else if (typeof element.src !== 'undefined') {
                element.src = window.URL.createObjectURL(stream);
            }
		}
		else if(browserName === 'Firefox') {
			element.mozSrcObject = stream;
            
            element.play();
		}
		else {
			// Not compliant
		}
		return element;	
	},

	/**
	 * RTCPeerConnection
	 * Compliant Firefox/Chrome
	 */

	RTCPeerConnection: function (stun, constraints) {
		if(browserName === 'Chrome') {
			return new window.webkitRTCPeerConnection(stun, constraints);
		} else if (browserName === 'Firefox') {
			return new window.mozRTCPeerConnection(stun, constraints);
		} else {
			return null;
		}
	},

	/** RTCSessionDescription
	 * Compliant Firefox/Chrome
	 */

	RTCSessionDescription: function (sdp) {
		if(browserName === 'Chrome') {
			return new window.RTCSessionDescription(sdp);
		} else if (browserName === 'Firefox') {
			return new window.mozRTCSessionDescription(sdp);
		} else {
			return null;
		}	
	},

	/**
	 * RTCIceCandidate
	 * Compliant Firefox/Chrome
	 */

	RTCIceCandidate: function (candidate) {
		if(browserName === 'Chrome') {
			return new window.RTCIceCandidate(candidate);
		} else if (browserName === 'Firefox') {
			return new window.mozRTCIceCandidate(candidate);
		} else {
			return null;
		}
	},

	/**
	 * RTCPeerConnectionConstraints
	 * Compliant Firefox/Chrome
	 */

	RTCPeerConnectionConstraints: function() {
		if(browserName === 'Chrome') {
			return {
				optional: [
					{
						//DtlsSrtpKeyAgreement: true
					}
				]
			};
		} else if (browserName === 'Firefox') {
			return {
				optional: [
					{
						RtpDataChannels: true
					}
				]
			};
		} else {
			return {};
		}
	},

	/**
     * Get the video ratio used when rendered
     * Ratio received is sometimes not the same as contraints asked
     */

    getVideoRatio: function(HTMLVideoElement) {
        if(HTMLVideoElement) {

            var ratio = {
                width: HTMLVideoElement.videoWidth,
                height: HTMLVideoElement.videoHeight
            };

            return ratio;
        }
        else {
            return  null;
        }
    },
};