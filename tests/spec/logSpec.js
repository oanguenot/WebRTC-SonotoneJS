describe("Logger module", function() {
    var logger,
        spy;

    beforeEach(function() {
        spy = sinon.spy(window.console, 'log');

        logger = require('sonotone/others/log');
    });

    afterEach(function() {
        window.console.log.restore();
        logger = null;
    });

    it("should not be null", function() {
        expect(logger).not.toBe(null);
    });

    it("should be activated by default", function() {
        expect(logger.isLogActivated()).toBe(true);
    });

    it("should answer false when calling unactivateLog function", function() {
        logger.unactivateLog();
        expect(logger.isLogActivated()).toBe(false);
    });

    it("should answer true when calling activateLog function", function() {
        logger.unactivateLog();
        logger.activateLog();
        expect(logger.isLogActivated()).toBe(true);
    });

    it("should add a trace to the console when activated", function() {

        logger.log('SONOTONE.IO', 'My Test message');

        expect(spy.calledOnce).toBe(true);
    });

    it('should not add trace to the console when unactivated', function() {

        logger.unactivateLog();

        logger.log('SONOTONE.IO', 'My Test message');

        expect(spy.called).toBe(false);
    });

});