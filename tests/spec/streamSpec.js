describe('MediaStream module', function() {

	var spy, Stream;

	beforeEach(function() {
        spy = sinon.spy();
        Stream = require('sonotone/stream/stream');
        

    });

    afterEach(function() {
        stream = null;
    });

	it('should have a null media stream by default', function() {
		var stream = new Stream();

		expect(stream.get()).toBe(null);
		expect(stream.getAudioTrack()).toBe(null);
		expect(stream.getVideoTrack()).toBe(null);
	});

	it('should have a default local type and a default video media', function() {
		var stream = new Stream();

		expect(stream.getType()).toEqual('local');
		expect(stream.getMedia()).toEqual('video');
	});	

	it('should have an empty id by default', function() {
		var stream = new Stream();

		expect(stream.ID()).not.toEqual('');
	});		

	it('should store the Media stream', function() {
		var s = {
			id: '1234'
		};

		var stream = new Stream(s, "screen", "remote");

		expect(stream.ID()).toEqual('1234');
		expect(stream.getMedia()).toEqual('screen');
		expect(stream.getType()).toEqual('remote');
	});

});