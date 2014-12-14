describe('Websocket module', function() {

	var websocket = require('../sonotone/transport/websocket');

	beforeEach(function() {

    });

    afterEach(function() {
    });

	it('should have a type equals to websocket', function() {
		expect(websocket.name()).toBe('websocket');
	});

	it('should send an event when no config specified', function() {

		var spy = sinon.spy();
		websocket.on('onTransportError', spy, this);
		websocket.connect();

		expect(spy.calledOnce).toBe(true);
	});

	it('should send an event when connection is ok', function() {

		var spy = sinon.spy();
		websocket.on('onTransportReady', spy, this);

		var returnObject = null;

		websocket._onOpen();

		expect(spy.calledOnce).toBe(true);
		expect(spy.calledWith(returnObject)).toBe(true);
		expect(websocket.isReady()).toBe(true);
	});

	it('should send an unknow event when receiving an unknow message', function() {

		var spy = sinon.spy();
		websocket.on('onTransportUnknownMessage', spy, this);

		var returnObject = {id: 'testID', data: 'testData'};

		websocket._onMessage(returnObject);

		expect(spy.calledOnce).toBe(true);
		expect(spy.calledWith(returnObject)).toBe(true);
		expect(websocket.isReady()).toBe(true);
	});

	it('should send an event when receiving a message', function() {

		var spy = sinon.spy();
		websocket.on('onTransportMessage', spy, this);

		var returnObject = {id:"testID", data:'{"data":{"type":"already_joined"},"callee":"1401857542594","caller":"1401857531895"}'};

		var messageReturned = {"data":{"type":"already_joined"},"callee":"1401857542594","caller":"1401857531895"};

		websocket._onMessage(returnObject);

		expect(spy.calledOnce).toBe(true);
		expect(spy.calledWith(messageReturned)).toBe(true);
	});

	it('should send an event when receiving any type of wellformated message', function() {

		var spy = sinon.spy();
		websocket.on('onTransportMessage', spy, this);

		var returnObject = {id:"testID", data:'{"data":{"type":"not_known_type"},"callee":"1401857542594","caller":"1401857531895"}'};

		var messageReturned = {"data":{"type":"not_known_type"},"callee":"1401857542594","caller":"1401857531895"};

		websocket._onMessage(returnObject);

		expect(spy.calledOnce).toBe(true);
		expect(spy.calledWith(messageReturned)).toBe(true);
	});



	it('should send an unknown event when receiving a strange message', function() {

		var spy = sinon.spy();
		websocket.on('onTransportUnknownMessage', spy, this);

		var returnObject = {id:"testID", data:'{"data":{},"callee":"1401857542594","caller":"1401857531895"}'};

		websocket._onMessage(returnObject);

		expect(spy.calledOnce).toBe(true);
		expect(spy.calledWith(returnObject)).toBe(true);
	});	

	it('should send an event when connection is closed', function() {

		var spy = sinon.spy();
		websocket.on('onTransportClosed', spy, this);

		var messageReturned = null;

		websocket._onClosed();

		expect(spy.calledOnce).toBe(true);
		expect(spy.calledWith(messageReturned)).toBe(true);
		expect(websocket.isReady()).toBe(false);
	});

	it('should send an event when connection has an error', function() {

		var spy = sinon.spy();
		websocket.on('onTransportError', spy, this);

		var messageReturned = 'error';

		websocket._onError(messageReturned);

		expect(spy.calledOnce).toBe(true);
		expect(spy.calledWith(messageReturned)).toBe(true);
		expect(websocket.isReady()).toBe(false);
	});

	it('should have a welcome and bye message', function() {
		expect(websocket.bye).not.toBe(null);
		expect(websocket.welcome).not.toBe(null);
	});	

});