function Events() {
    this.events = {};
}

/**
 * Subscribe to an event
 * @param {String} name The event to subscribe
 * @param {Function} callbackFunction The function to call
 * @param {Object} context The context to use when calling the callback function
 *
 * @api public
 */

Events.prototype.on = function(name, callback, context) {
    if(!this._events) {
        this._events = {};
    }
    
    var events = this._events[name] || (this._events[name] = []);
    
    events.push({callback: callback, ctx: context || this});
    
    return this;
};

/**
 * Unsubscribe to an event
 * @param {String} name The event to subscribe
 * @param {Function} callbackFunction The function to call
 *
 * @api public
 */

Events.prototype.off = function(name, callback) {
    if(this._events) {
        var events = this._events[name];
        if(events) {

            var index = -1;

            for (var i = 0, l = events.length; i < l; i++) {
                if(callback === events[i].callback) {
                    index = i;
                }
            }

            if(index > -1) {
                events.splice(index, 1);
            }
        }
    }
};

/**
 * Trigger an event
 * @param {String} name The event to subscribe
 * @param {args} Arguments to send to the callback function
 *
 * @api public
 */

Events.prototype.trigger = function(name, args) {
    if (!this._events) {
        return this;
    }
    var events = this._events[name];

    if (events) {
        for (var i=0;i<events.length;i++) {
            events[i].callback.call(events[i].ctx, args);
        }
    }
};

/**
 * Return the list of suscribed events/callbacks
 *
 * @api public/test
 */

Events.prototype.get = function() {
    return this.events;
};

module.exports = Events;