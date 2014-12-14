describe('PeerConnection module', function() {

	var spy, PeerConnection;

	beforeEach(function() {
        spy = sinon.spy();
        PeerConnection = require('sonotone/rtc/peerConnection');
    });

    afterEach(function() {
    });

	it('should have an ID by default', function() {
		var pc = new PeerConnection();
		expect(pc.ID()).not.toBe(null);
		pc = null;
	});

	it('should not be the caller by default', function() {
		var pc = new PeerConnection();
		expect(pc.amICaller()).toBe(false);
		var pc=null;
	});

	it('should have the ID given to the constructor', function() {
		var pc = new PeerConnection('audio', 'peer1');
		expect(pc.ID()).toBe('peer1');
		pc = null;
	});	

	it('should have the ID given by the ID method', function() {
		var pc = new PeerConnection('audio', 'peer1');
		pc.ID('peer2');
		expect(pc.ID()).toBe('peer2');
		pc = null;
	});	

	it('should have default media type set to video', function() {
		var pc = new PeerConnection();
		expect(pc.media()).toBe('video');
		pc = null;
	});	

	it('should have a peer Connection not null', function() {
		var pc = new PeerConnection('peer1');
		expect(pc.peerConnection()).not.toBe(null);
		pc = null;
	});

	it('should fire an event when receiving ICE Candidate', function() {
		var pc = new PeerConnection();
		var spy = sinon.spy();

		pc.on('onICECandiateReceived', spy, this);

		pc._onICECandidate({candidate: 'sdp1'});

		expect(spy.called).toBe(true);
	});


});