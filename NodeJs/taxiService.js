var util = require('util');
var events = require('events');

function taxiService(smsGate, options) {
	var that = this;

	this.sendOrder = function() {
	  	smsGate.send(options.phoneNumber, options.orderMessage);
	};

	smsGate.on('received', function(e){
		var m = e.message;

		if(m.indexOf('Tilaus ') === 0)
		{
			var orderNumber = m.substring(m.lastIndexOf(' ') + 1, m.length - 1);
	 		that.emit('orderConfirmed', {orderNumber: orderNumber});
		}
		else if(m.indexOf('Taksi ') === 0)
		{
			var taxiNumber = m.split(' ')[2];
	 		that.emit('taxiConfirmed', {taxiNumber: taxiNumber});
		}
		else if(m.indexOf('Kaikki ') === 0)
		{
	 		that.emit('allBusy');
		}
		else
		{
	 		that.emit('unknown', {phoneNumber: e.phoneNumber, message: e.message});
		}
	});

	events.EventEmitter.call(this)
}

util.inherits(taxiService, events.EventEmitter);
module.exports = taxiService;