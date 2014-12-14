describe("Adapter module", function() {
    var adapter, browserName;

    var constraints = {
        audio: true,
        video: {
            mandatory: {
                maxWidth: 320, maxHeight: 240
            },
            optional: []
        }
    };

    beforeEach(function() {
        adapter = require('sonotone/others/adapter');
        browserName = adapter.browserName();
    });

    afterEach(function() {
        adapter = null;
    });

    it("should not be null", function() {
         expect(adapter).not.toBe(null);
    });

    it('should call the getUserMedia specific browser api', function() {
        var stub;

        var callbackSpy = sinon.spy();
        var errorCallbackSpy = sinon.spy();

        if(browserName === 'Chrome') {
            stub = sinon.stub(navigator, 'webkitGetUserMedia');
        }
        else if(browserName === 'Firefox') {
            stub = sinon.stub(navigator, 'mozGetUserMedia');
        }

        stub.callsArg(1);

        adapter.getUserMedia(constraints, callbackSpy, errorCallbackSpy, this);

        expect(stub.called).toBe(true);

        if(browserName === 'Chrome') {
            navigator.webkitGetUserMedia.restore();    
        }
        else if(browserName === 'Firefox') {
            navigator.mozGetUserMedia.restore();       
        }
        
    });

    it('should call the callback in case of success', function() {
        var stub;

        var callbackSpy = sinon.spy();
        var errorCallbackSpy = sinon.spy();

        if(browserName === 'Chrome') {
            stub = sinon.stub(navigator, 'webkitGetUserMedia');
        }
        else if(browserName === 'Firefox') {
            stub = sinon.stub(navigator, 'mozGetUserMedia');
        }

        stub.callsArg(1);

        adapter.getUserMedia(constraints, callbackSpy, errorCallbackSpy, this);

        expect(callbackSpy.called).toBe(true);
        expect(errorCallbackSpy.called).toBe(false);

        if(browserName === 'Chrome') {
            navigator.webkitGetUserMedia.restore();    
        }
        else if(browserName === 'Firefox') {
            navigator.mozGetUserMedia.restore();       
        }

    });

    it('should call the error callback in case of error', function() {
        var stub;

        var callbackSpy = sinon.spy();
        var errorCallbackSpy = sinon.spy();

        if(browserName === 'Chrome') {
            stub = sinon.stub(navigator, 'webkitGetUserMedia');
        }
        else if(browserName === 'Firefox') {
            stub = sinon.stub(navigator, 'mozGetUserMedia');
        }

        stub.callsArg(2);

        adapter.getUserMedia(constraints, callbackSpy, errorCallbackSpy, this);

        expect(callbackSpy.called).toBe(false);
        expect(errorCallbackSpy.called).toBe(true);

        if(browserName === 'Chrome') {
            navigator.webkitGetUserMedia.restore();    
        }
        else if(browserName === 'Firefox') {
            navigator.mozGetUserMedia.restore();       
        }
    });

    it('should get the video track dependly to the browser used', function() {
        var spy, mediaStream;

        if(browserName === 'Chrome') {
            mediaStream = new webkitMediaStream();

            spy = sinon.spy(mediaStream, 'getVideoTracks');

            adapter.getVideoTracks(mediaStream);

            expect(spy.called).toBe(true);
            expect(spy.returned([])).toBe(true);

            mediaStream.getVideoTracks.restore();
        
        }
    });

    it('should get the audio track dependly to the browser used', function() {
        var spy, mediaStream;

        if(browserName === 'Chrome') {
            mediaStream = new webkitMediaStream();

            spy = sinon.spy(mediaStream, 'getAudioTracks');

            adapter.getAudioTracks(mediaStream);

            expect(spy.called).toBe(true);
            expect(spy.returned([])).toBe(true);

            mediaStream.getAudioTracks.restore();
        
        }
    });

    it('should call the RTCPeerConnection specific browser api', function() {
        var stub;

        var stun = {};
        var constraints = {};

        if(browserName === 'Chrome') {
            stub = sinon.stub(window, 'webkitRTCPeerConnection');
        }
        else if(browserName === 'Firefox') {
            stub = sinon.stub(window, 'mozRTCPeerConnection');
        }

        adapter.RTCPeerConnection(stun,constraints);

        expect(stub.called).toBe(true);
        expect(stub.calledWithMatch({}, {})).toBe(true);

        if(browserName === 'Chrome') {
            window.webkitRTCPeerConnection.restore();    
        }
        else if(browserName === 'Firefox') {
            window.mozRTCPeerConnection.restore();       
        }
        
    });

    it('should call the RTCIceCandidate specific browser api', function() {
        var stub;

        var candidate = {};

        if(browserName === 'Chrome') {
            stub = sinon.stub(window, 'RTCIceCandidate');
        }
        else if(browserName === 'Firefox') {
            stub = sinon.stub(window, 'mozRTCIceCandidate');
        }

        adapter.RTCIceCandidate(candidate);

        expect(stub.called).toBe(true);
        expect(stub.calledWithMatch({})).toBe(true);

        if(browserName === 'Chrome') {
            window.RTCIceCandidate.restore();    
        }
        else if(browserName === 'Firefox') {
            window.mozRTCIceCandidate.restore();       
        }
        
    });

});
