describe("LocalMedia module", function() {
    var local;

    beforeEach(function() {
        local = require('sonotone/stream/localMedia');
    });

    afterEach(function() {
        local = null;
    });

    it("should not be null", function() {
        expect(local).not.toBe(null);
    });

    it('should have null streams by default', function() {
        expect(local.streamCamera()).toBe(null);
        expect(local.streamScreen()).toBe(null);
    })

    it("should have screen captured flag equals false by default", function() {
        expect(local.isScreenCaptured()).toBe(false);
    });

    it("should have camera captured flag equals false by default", function() {
        expect(local.isCameraCaptured()).toBe(false);
    });

    it('should get video stream when camera stream is acquired', function() {

        var adapter = require('sonotone/others/adapter');

        var stub = sinon.stub(adapter, "getUserMedia");

        var videoStub = sinon.stub(adapter, "getVideoTracks"),
            audioStub = sinon.stub(adapter, "getAudioTracks");

        var stream = {
            id: 'cameraStream'
        };

        var audioProfile = {
            media: true,
            source: '123456'
        };

        var videoProfile = {
            media: true,
            source: '123456'
        };

        stub.callsArgWith(1, stream);
        videoStub.returns([0]);
        audioStub.returns([0]);

        local.acquire(audioProfile, videoProfile, 'cam');

        expect(local.isCameraCaptured()).toBe(true);
        expect(local.streamCamera()).toEqual(stream);

        adapter.getUserMedia.restore();
        adapter.getVideoTracks.restore();
        adapter.getAudioTracks.restore();
    });

    it('should trigger an event when camera is acquired', function() {

        var spy = sinon.spy(),
            spyError = sinon.spy();

        local.on('onLocalVideoStreamStarted', spy, this);
        local.on('onLocalVideoStreamError', spyError, this);

        var adapter = require('sonotone/others/adapter');

        var stub = sinon.stub(adapter, "getUserMedia");

        var videoStub = sinon.stub(adapter, "getVideoTracks"),
            audioStub = sinon.stub(adapter, "getAudioTracks");


        var stream = {
            id: 'cameraStream'
        };

        var audioProfile = {
            media: true,
            source: '123456'
        };

        var videoProfile = {
            media: true,
            source: '123456'
        };

        stub.callsArgWith(1, stream);
        videoStub.returns([0]);
        audioStub.returns([0]);

        local.acquire(audioProfile, videoProfile, 'cam');

        expect(spy.called).toBe(true);
        spy.calledWithMatch({media: 'video', stream: stream});
        expect(spyError.called).toBe(false);

        adapter.getUserMedia.restore();
        adapter.getVideoTracks.restore();
        adapter.getAudioTracks.restore();
    });

    it('should trigger an event when camera can t be acquired too', function() {

        var spy = sinon.spy(),
            spyError = sinon.spy();

        local.on('onLocalVideoStreamStarted', spy, this);
        local.on('onLocalVideoStreamError', spyError, this);

        var adapter = require('sonotone/others/adapter');

        var stub = sinon.stub(adapter, "getUserMedia");

        var videoStub = sinon.stub(adapter, "getVideoTracks"),
            audioStub = sinon.stub(adapter, "getAudioTracks");

        var stream = {
            id: 'cameraStream'
        };

        var audioProfile = {
            media: true,
            source: '123456'
        };

        var videoProfile = {
            media: true,
            source: '123456'
        };

        stub.callsArgWith(2, null);
        videoStub.returns([0]);
        audioStub.returns([0]);

        local.acquire(audioProfile, videoProfile, 'cam');

        expect(spy.called).toBe(false);
        expect(spyError.called).toBe(true);
        spyError.calledWithMatch({code: 1, message:"", name: "PERMISSION_DENIED"});

        adapter.getUserMedia.restore();
        adapter.getVideoTracks.restore();
        adapter.getAudioTracks.restore();
    });

});