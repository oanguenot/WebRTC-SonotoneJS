describe('Configuration module', function() {

	var config = require('../sonotone/others/configuration');

	beforeEach(function() {
		config.useSTUN(false);
		config.useTURN(false);
    });

    afterEach(function() {
    });

	it('should not use STUN by default', function() {
		expect(config.isSTUNUsed()).toBe(false);
	});

	it('should not use TURN by default', function() {
		expect(config.isTURNUsed()).toBe(false);
	});

	it('should have a default STUN configuration defined', function() {
		var defaultGoogleStunServer = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
		expect(config.STUN()).toMatch(defaultGoogleStunServer);
	});

	it('should have an empty TURN configuration defined', function() {
		var defaultTURNServer = {};
		expect(config.TURN()).toMatch(defaultTURNServer);
	});

	it('should return the new STUN configuration set', function() {
		var newSTUNServer = {};
		config.STUN(newSTUNServer);
		expect(config.STUN()).toMatch(newSTUNServer);
	});

	it('should return the new TURN configuration set', function() {
		var newTURNServer = {'iceServers': {}};
		config.TURN(newTURNServer);
		expect(config.TURN()).toMatch(newTURNServer);
	});

	it('should activate STUN configuration', function() {
		config.useSTUN(true);
		expect(config.isSTUNUsed()).toBe(true);
	});

	it('should activate TURN configuration', function() {
		config.useTURN(true);
		expect(config.isTURNUsed()).toBe(true);
	});

	it('should return the correct STUN configuration accordingly to the setting', function() {

		expect(config.getSTUNConfiguration()).toBe(null);

		var stunConfig = {url: 'http://...'};

		config.STUN(stunConfig);
		expect(config.getSTUNConfiguration()).toMatch(null);

		config.useSTUN(true);
		expect(config.getSTUNConfiguration()).toBe(stunConfig);
	});

	it('should return the correct TURN configuration accordingly to the setting', function() {
		expect(config.getTURNConfiguration()).toMatch(null);

		var turnConfig = {url: 'http://...'};

		config.TURN(turnConfig);
		expect(config.getTURNConfiguration()).toMatch(null);

		config.useTURN(true);
		expect(config.getTURNConfiguration()).toBe(turnConfig);
	});


});