describe("IO module", function() {
    var io;

    beforeEach(function() {
        io = require('sonotone/io');
        io.setTransport(null);
    });

    afterEach(function() {
        io = null;
    });

    it("should not be null", function() {
        expect(io).not.toBe(null);
    });

    it('should have a localmedia', function() {
        expect(io.localMedia()).not.toBe(null);
    });

    it('should have a websocket transport', function() {
        expect(io.transport('websocket')).not.toBe(null);
    });

    it('should not have an unknown transport', function() {
        expect(io.transport('unknown')).toBe(null);
    });

    it('should have a sources', function() {
        expect(io.sources()).not.toBe(null);
    });

    it('should send an event when a peer is connected', function() {
        var spy = sinon.spy()
        io.on('onPeerConnected', spy, this);
        io._onMessage({ data: {type: 'join', caps:'1234'}, caller: 'toto'});
        expect(spy.called).toBe(true);
        expect(spy.calledWithMatch(io.peers()['toto'])).toBe(true);
    });

    it('should send event when a peer is already connected', function() {
        var spy = sinon.spy()
        io.on('onPeerAlreadyConnected', spy, this);
        io._onMessage({ data: {type: 'already_joined', caps:'1234'}, caller: 'titi'});
        expect(spy.called).toBe(true);
        expect(spy.calledWithMatch(io.peers()['titi'])).toBe(true);
    });

    it('should send event when a peer is disconnected', function() {
        var spy = sinon.spy()
        io.on('onPeerDisconnected', spy, this);
        var old = io.peers()['toto'];
        io._onMessage({ data: {type: 'exited'}, caller: 'toto'});
        expect(spy.called).toBe(true);
        expect(spy.calledWithMatch(old)).toBe(true);
    });

    it('should send event when receiving a im from a peer', function() {
        var spy = sinon.spy()
        io.on('onPeerIMMessage', spy, this);
        io._onMessage({ data: {type: 'im', content: 'hello', private: true}, caller: 'toto'});
        expect(spy.called).toBe(true);
        expect(spy.calledWithMatch({id: 'toto', content: 'hello', private: true})).toBe(true);
    });

    it('should send event when receiving a end call from a peer', function() {
        var spy = sinon.spy()
        io.on('onPeerEndCall', spy, this);
        io._onMessage({ data: {type: 'bye'}, media: 'video', caller: 'toto'});
        expect(spy.called).toBe(true);
        expect(spy.calledWithMatch({id: 'toto', media: 'video'})).toBe(true);
    });

    it('should send event when receiving a IQResult', function() {
       var spy = sinon.spy()
        io.on('onIQResult', spy, this);
        var json = { data: {type: 'iq_result', selector: 'connected', value: false, id:'azertyuiop'}, caller: 'toto'};
        io._onMessage(json);
        expect(spy.called).toBe(true);
        var res = {id: 'azertyuiop', value: false, selector: 'connected'};
        expect(spy.calledWithMatch(res)).toBe(true); 
    });

    it('should call the transport layer when sending an IM message to all', function() {

        var caps = require('sonotone/others/capabilities');
        var transport = {send: function(msg){}};
        var stub = sinon.stub(transport, 'send');

        io.setTransport(transport);
        io.sendIMMessage('hello', 'all');
        expect(stub.called).toBe(true);
        expect(stub.calledWithMatch({data: {type: 'im', content: 'hello', private: false}, caller: caps.ID(), callee: 'all'})).toBe(true);
    });

    it('should call the transport layer when sending an IM message to a specific peer', function() {

        var caps = require('sonotone/others/capabilities');
        var transport = {send: function(msg){}};
        var stub = sinon.stub(transport, 'send');

        io.setTransport(transport);
        io.sendIMMessage('hello', 'peer1');
        expect(stub.called).toBe(true);
        expect(stub.calledWithMatch({data: {type: 'im', content: 'hello', private: true}, caller: caps.ID(), callee: 'peer1'})).toBe(true);
    });

    it('should call the transport layer when sending an IM message to a all peer (null parameter)', function() {

        var caps = require('sonotone/others/capabilities');
        var transport = {send: function(msg){}};
        var stub = sinon.stub(transport, 'send');

        io.setTransport(transport);
        io.sendIMMessage('hello');
        expect(stub.called).toBe(true);
        expect(stub.calledWithMatch({data: {type: 'im', content: 'hello', private: false}, caller: caps.ID(), callee: 'all'})).toBe(true);
    });

    it('should not call the transport layer when there is no transport', function() {
        var returnCode = io.sendIMMessage('hello', 'peer1');
        expect(returnCode).toBe(-1);
    });

    it('should call the transport layer when querying a user', function() {
        var caps = require('sonotone/others/capabilities');
        var transport = {send: function(msg){}};
        var stub = sinon.stub(transport, 'send');

        io.setTransport(transport);
        io.queryConnected('azertyuiop');
        expect(stub.called).toBe(true);
        expect(stub.calledWithMatch({data: {type: 'iq', selector: 'connected', id: 'azertyuiop'}, caller: caps.ID(), callee: null})).toBe(true);
    });

    it('should set the identity of the user', function() {
        var c = require('sonotone/others/capabilities');

        var caps = {
            id: '1234',
            username: 'john doe'
        };

        io.setIdentity(caps);
        expect(c.caps()).toMatch(caps);
    });
});
