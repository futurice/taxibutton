var util = require('util');
var events = require('events');
var http = require('http');
var querystring = require('querystring');

function smsGate(options, secrets) {
	var that = this;

	this.receive = function(phoneNumber, message) {
	 	that.emit('received', {phoneNumber: phoneNumber, message: message});
	};

	this.send = function(phoneNumber, message) {
		var emitSent = function(){
			that.emit('sent', {phoneNumber: phoneNumber, message: message});
		};

		if(options.isFaked)
		{
	 		emitSent();
	 		return;
		}

		var query = {
			username: secrets.credentials.username,
			password: secrets.credentials.password,
			to: phoneNumber,
			text: message
		};

		var requestOptions = {
			host: options.host,
			port: options.port,
			path: options.path + '?' + querystring.stringify(query)
		};

		var request = http.request(requestOptions, function(res){
	 		emitSent();
		});

		request.on('error', function(err) {
			that.emit('sending-error', {innerError: err, phoneNumber: phoneNumber, message: message});
		});

		request.end();
	};

	events.EventEmitter.call(this)
}

util.inherits(smsGate, events.EventEmitter);
module.exports = smsGate;