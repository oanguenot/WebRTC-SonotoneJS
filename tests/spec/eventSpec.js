describe("Event module", function() {
    var Events, 
        events,
        spy, secondSpy;

    beforeEach(function() {
        spy = sinon.spy();
        secondSpy = sinon.spy();
        Events = require('sonotone/others/event');
        events = new Events();

    });

    afterEach(function() {
        events = null;
    });

    it("should have no subscribed events/callback", function() {
        expect(events.get()).toEqual({});
    });

    it("should call my callback", function () {
        events.on('myEvent', spy, this);
        events.trigger('myEvent', null);

        expect(spy.called).toBe(true);
    });

    it("should not call my callback when subscribing to another event", function () {
        events.on('myOtherEvent', spy, this);
        events.trigger('myEvent', null);

        expect(spy.called).toBe(false);
    }); 

    it("should call each callback once", function () {
        events.on('myEvent', spy, this);
        events.on('myEvent', secondSpy, this);
        events.trigger('myEvent', null);

        expect(spy.calledOnce).toBe(true);
        expect(secondSpy.calledOnce).toBe(true);
    });    

    it("should call the callback each time the event is fired", function () {
        events.on('myEvent', spy, this);
        events.trigger('myEvent', null);
        events.trigger('myEvent', null);
        events.trigger('myOtherEvent', null);
        events.trigger('myEvent', null);
        
        expect(spy.calledThrice).toBe(true);
    });  

    it('should not call my callback when unsubscribed', function() {
        events.on('myEvent', spy, this);
        events.off('myEvent', spy);
        events.trigger('myEvent', null);

        expect(spy.called).toBe(false);
    });

    it('should unsubscribe the right callback', function() {
        events.on('myEvent', spy, this);
        events.on('myEvent', secondSpy, this);
        events.off('myEvent', secondSpy);
        events.trigger('myEvent', null);

        expect(spy.called).toBe(true);
        expect(secondSpy.called).toBe(false);
    });

});