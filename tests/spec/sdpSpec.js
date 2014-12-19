describe("SDP module", function() {
    var sdpMng,
        spy;

     var definedSDP = 
     	"v=0\r\n" + 
		"m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
		"a=rtpmap:111 opus/48000/2\r\n" +
		"a=fmtp:111 minptime=10\r\n" +
		"a=rtpmap:103 ISAC/16000\r\n" +
		"a=rtpmap:104 ISAC/32000\r\n" +
		"a=rtpmap:0 PCMU/8000\r\n" +
		"a=rtpmap:8 PCMA/8000\r\n" +
		"a=rtpmap:106 CN/32000\r\n" +
		"a=rtpmap:105 CN/16000\r\n" +
		"a=rtpmap:13 CN/8000\r\n" +
		"a=rtpmap:126 telephone-event/8000\r\n" +
		"a=maxptime:60\r\n";

	var G711SDP =
		"v=0\r\n" + 
		"m=audio 1 RTP/SAVPF 0 8 111 103 104 106 105 13 126\r\n" +
		"a=rtpmap:111 opus/48000/2\r\n" +
		"a=fmtp:111 minptime=10\r\n" +
		"a=rtpmap:103 ISAC/16000\r\n" +
		"a=rtpmap:104 ISAC/32000\r\n" +
		"a=rtpmap:0 PCMU/8000\r\n" +
		"a=rtpmap:8 PCMA/8000\r\n" +
		"a=rtpmap:106 CN/32000\r\n" +
		"a=rtpmap:105 CN/16000\r\n" +
		"a=rtpmap:13 CN/8000\r\n" +
		"a=rtpmap:126 telephone-event/8000\r\n" +
		"a=maxptime:60\r\n";

	var definedSDP_2 = 
		"m=video 55520 RTP/SAVPF 120 126 97\r\n" +
		"c=IN IP4 135.244.226.80\r\n" +
		"a=rtpmap:120 VP8/90000\r\n" +
		"a=rtpmap:126 H264/90000\r\n" +
		"a=fmtp:126 profile-level-id=42e01f;packetization-mode=1\r\n" +
		"a=rtpmap:97 H264/90000\r\n" +
		"a=fmtp:97 profile-level-id=42e01f";

	var H264SDP = 
		"m=video 55520 RTP/SAVPF 126 97 120\r\n" +
		"c=IN IP4 135.244.226.80\r\n" +
		"a=rtpmap:120 VP8/90000\r\n" +
		"a=rtpmap:126 H264/90000\r\n" +
		"a=fmtp:126 profile-level-id=42e01f;packetization-mode=1\r\n" +
		"a=rtpmap:97 H264/90000\r\n" +
		"a=fmtp:97 profile-level-id=42e01f";

	var fullSDP =
		"m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=sendrecv\r\n" +
		"m=video 1 RTP/SAVPF 100 116 117 96\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=sendrecv";

	var fullSDPBis =
		"m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=sendonly\r\n" +
		"m=video 1 RTP/SAVPF 100 116 117 96\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=sendrecv";

	var audioOnlySDP =
		"m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=sendrecv\r\n" +
		"m=video 1 RTP/SAVPF 100 116 117 96\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=recvonly";

	var videoOnlySDP =
		"m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=recvonly\r\n" +
		"m=video 1 RTP/SAVPF 100 116 117 96\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=sendrecv";

	var noMediaInSDP = 
		"m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=recvonly\r\n" +
		"m=video 1 RTP/SAVPF 100 116 117 96\r\n" +
		"c=IN IP4 0.0.0.0\r\n" +
		"a=recvonly";

	var definedSDP_3 = 
		"m=video 55520 RTP/SAVPF 120 126 97\r\n" +
		"c=IN IP4 135.244.226.80\r\n" +
		"a=rtpmap:120 VP8/90000\r\n" +
		"a=rtpmap:126 TOTO/90000\r\n" +
		"a=fmtp:126 profile-level-id=42e01f;packetization-mode=1\r\n" +
		"a=rtpmap:97 TATA/90000\r\n" +
		"a=fmtp:97 profile-level-id=42e01f";

	var totoSDP = 
		"m=video 55520 RTP/SAVPF 126 120 97\r\n" +
		"c=IN IP4 135.244.226.80\r\n" +
		"a=rtpmap:120 VP8/90000\r\n" +
		"a=rtpmap:126 TOTO/90000\r\n" +
		"a=fmtp:126 profile-level-id=42e01f;packetization-mode=1\r\n" +
		"a=rtpmap:97 TATA/90000\r\n" +
		"a=fmtp:97 profile-level-id=42e01f";

	var sdpAudioBandwidth = 
		"v=0\r\n" + 
		"m=audio 1 RTP/SAVPF 0 8 111 103 104 106 105 13 126\r\n" +
		"a=rtpmap:111 opus/48000/2\r\n" +
		"a=fmtp:111 minptime=10\r\n" +
		"a=rtpmap:103 ISAC/16000\r\n" +
		"a=mid:audio\r\n" +
		"a=fmtp:111 minptime=10";

	var sdpVideoBandwidth = 
		"m=video 55520 RTP/SAVPF 120 126 97\r\n" +
		"c=IN IP4 135.244.226.80\r\n" +
		"a=rtpmap:120 VP8/90000\r\n" +
		"a=rtpmap:126 TOTO/90000\r\n" +
		"a=fmtp:126 profile-level-id=42e01f;packetization-mode=1\r\n" +
		"a=rtpmap:97 TATA/90000\r\n" +
		"a=mid:video\r\n" +
		"a=fmtp:97 profile-level-id=42e01f";

	var limitedAudioBandwidth = 
		"v=0\r\n" + 
		"m=audio 1 RTP/SAVPF 0 8 111 103 104 106 105 13 126\r\n" +
		"a=rtpmap:111 opus/48000/2\r\n" +
		"a=fmtp:111 minptime=10\r\n" +
		"a=rtpmap:103 ISAC/16000\r\n" +
		"a=mid:audio\r\n" +
		"b=AS:20\r\n" +
		"a=fmtp:111 minptime=10";

	var limitedVideoBandwidth = 
		"m=video 55520 RTP/SAVPF 120 126 97\r\n" +
		"c=IN IP4 135.244.226.80\r\n" +
		"a=rtpmap:120 VP8/90000\r\n" +
		"a=rtpmap:126 TOTO/90000\r\n" +
		"a=fmtp:126 profile-level-id=42e01f;packetization-mode=1\r\n" +
		"a=rtpmap:97 TATA/90000\r\n" +
		"a=mid:video\r\n" +
		"b=AS:256\r\n" +
		"a=fmtp:97 profile-level-id=42e01f";

	var sdpwithoutfec = 
     	"v=0\r\n" + 
		"m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
		"a=rtpmap:111 opus/48000/2\r\n" +
		"a=fmtp:111 minptime=10\r\n" +
		"a=rtpmap:103 ISAC/16000\r\n";

	var sdpwithfec = 
		"v=0\r\n" + 
		"m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
		"a=rtpmap:111 opus/48000/2\r\n" +
		"a=fmtp:111 minptime=10; useinbandfec=1\r\n" +
		"a=rtpmap:103 ISAC/16000\r\n";

	var sdpwithstereo = 
		"v=0\r\n" + 
		"m=audio 1 RTP/SAVPF 111 103 104 0 8 106 105 13 126\r\n" +
		"a=rtpmap:111 opus/48000/2\r\n" +
		"a=fmtp:111 minptime=10; stereo=1; sprop-stereo=1\r\n" +
		"a=rtpmap:103 ISAC/16000\r\n";

    beforeEach(function() {
        sdpMng = require('sonotone/others/sdp');
    });

    afterEach(function() {
        sdpMng = null;
    });

    it("should not be null", function() {
        expect(sdpMng).not.toBe(null);
    });

    it('should have a method to force G711', function() {
    	expect(typeof sdpMng.forceAudioCodecTo).toBe('function');
    });

    it('should return a string when forcing G711 codec', function() {
    	expect(typeof sdpMng.forceAudioCodecTo(definedSDP, 'PCMU/8000')).toBe('string');
    });

    it('should return a sdp where G711 is forced', function() {
    	var computedSDP = sdpMng.forceAudioCodecTo(definedSDP, 'PCMU/8000');
    	expect(computedSDP).toEqual(G711SDP);
    });

    it('should have a method to force H264', function() {
    	expect(typeof sdpMng.forceVideoCodecTo).toBe('function');
    });

    it('should return a string when forcing H264 codec', function() {
    	expect(typeof sdpMng.forceVideoCodecTo(definedSDP_2)).toBe('string');
    });

    it('should return a sdp where H264 is forced', function() {
    	var computedSDP = sdpMng.forceVideoCodecTo(definedSDP_2, 'H264/90000');
    	expect(computedSDP).toEqual(H264SDP);
    });

    it('should return full if there is audio and video in sdp', function() {
    	var media = sdpMng.getMediaInSDP(fullSDP);
    	expect(media).toEqual("full");
    });

    it('should return full if there is audio and video (sendonly) in sdp', function() {
    	var media = sdpMng.getMediaInSDP(fullSDPBis);
    	expect(media).toEqual("full");
    });

    it('should return audio if there is only audio involved in sdp', function() {
    	var media = sdpMng.getMediaInSDP(audioOnlySDP);
    	expect(media).toEqual("audio");
    });

    it('should return video if there is only video involved in sdp', function() {
    	var media = sdpMng.getMediaInSDP(videoOnlySDP);
    	expect(media).toEqual("video");
    });

    it('should return no if there is no media involved in sdp', function() {
    	var media = sdpMng.getMediaInSDP(noMediaInSDP);
    	expect(media).toEqual("no");
    });

    it('should return the codec when answer is G711', function() {
    	var codec = sdpMng.getFirstAudioCodec(G711SDP);
    	expect(codec).toEqual('PCMU/8000');
    });

    it('should return the codec H264 when answer is H264', function() {
    	var codec = sdpMng.getFirstVideoCodec(H264SDP);
    	expect(codec).toEqual('H264/90000');
    });

    it('should return the same SDP if the required codec is not in the list', function() {
    	var computedSDP = sdpMng.forceVideoCodecTo(definedSDP_3, 'H264/90000');
    	expect(computedSDP).toEqual(definedSDP_3);
    });

	it('should force any video codec if it exists', function() {
    	var computedSDP = sdpMng.forceVideoCodecTo(definedSDP_3, "TOTO/90000");
    	expect(computedSDP).toEqual(totoSDP);
    }); 

    it('should force the audio bandwidth to 20', function() {
		var limited = sdpMng.limitAudioBandwidthTo(sdpAudioBandwidth, 20);
		expect(limited).toEqual(limitedAudioBandwidth);	
    });

    it('should force the video bandwidth to 256', function() {
		var limited = sdpMng.limitVideoBandwidthTo(sdpVideoBandwidth, 256);
		expect(limited).toEqual(limitedVideoBandwidth);	
    });

    it('should add FEC support', function() {
    	var sdp = sdpMng.addFECSupport(sdpwithoutfec);
    	expect(sdp).toEqual(sdpwithfec);
    });

    it('should add Stereo support', function() {
    	var sdp = sdpMng.addStereoSupport(sdpwithoutfec);
    	expect(sdp).toEqual(sdpwithstereo);
    });


});






