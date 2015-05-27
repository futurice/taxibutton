var util = require('util');
var events = require('events');
var http = require('http');
var querystring = require('querystring');
var config = require('./config');

function smsGate() {
	var that = this;

	this.receive = function(phoneNumber, message) {
	 	that.emit('received', {phoneNumber: phoneNumber, message: message});
	};

	this.send = function(phoneNumber, message) {
		var emitSent = function(){
			that.emit('sent', {phoneNumber: phoneNumber, message: message});
		};

		if(config.smsGate.isFaked)
		{
	 		emitSent();
	 		return;
		}

		var query = {
			username: config.smsGate.credentials.username,
			password: config.smsGate.credentials.password,
			to: phoneNumber,
			text: message
		};

		var options = {
			host: config.smsGate.host,
			port: config.smsGate.port,
			path: config.smsGate.path + '?' + querystring.stringify(query)
		};

		var request = http.request(options, function(res){
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