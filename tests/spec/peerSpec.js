describe('Peer module', function() {

	var Peer = require('../sonotone/others/peer');

	beforeEach(function() {

    });

    afterEach(function() {
    });

	it('should have an ID', function() {
		var peer = new Peer();
		expect(peer.ID()).not.toBe(null);
		peer = null;

		peer = new Peer('123456');
		expect(peer.ID()).toBe('123456');
		peer = null;
	});

	it('should return a null capabilities by default', function() {
		var peer = new Peer();
		
		expect(peer.caps()).toBe(null);
		peer = null;
	});

	it('should return the capabilities', function() {
		var peer = new Peer();
		var caps = {prop1: 'value1'};
		peer.caps(caps);
		
		expect(peer.caps()).toBe(caps);
	});

	it('should return an error when calling with an unknown media', function() {

		var peer = new Peer();
		var err = peer.call('unknow_media');
		
		expect(err).toBe('media_unknown');
	});

	it('should return an error when calling the same peer with the same media', function() {
		var peer = new Peer();
		var pcs = {'video': {}};
		peer._peerConnections(pcs);
		var err = peer.call('video');

		expect(err).toBe('already_in_call');

	});
});