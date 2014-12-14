describe('Capabilities module', function() {

	var capabilities = require('../sonotone/others/capabilities');

	beforeEach(function() {

    });

    afterEach(function() {
    });

	it('should have an ID', function() {
		expect(capabilities.ID()).not.toBe(null);
	});

	it('should return capabilities', function() {
		expect(capabilities.caps()).not.toBe(null);
	});

	it('should set the right id', function() {
		capabilities.setID('azertyuiop');
		expect(capabilities.ID()).toEqual('azertyuiop');
	});

	it('should have a default username', function() {
		expect(capabilities.userName()).toEqual('Anonymous');
	});

	it('should be possible to set the username', function() {
		expect(capabilities.userName('John Doe')).toEqual('John Doe');
	});
});