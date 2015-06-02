var util = require('util');
var config = require('./config');

function webSocketNotifier(wsServer, taxiService, taxiMachine) {
	var that = this;

	var sendJson = function(connection, obj)
	{
		connection.sendText(JSON.stringify(obj));
	};

	var broadcast = function(obj)
	{
	    wsServer.connections.forEach(function (connection) {
	        sendJson(connection, obj);
	    });
	};

    wsServer.on('connection', function(connection){
    	var message = {
			type: 'config',
			config: config
		};
        sendJson(connection, message);
    });

    taxiService.on('unrecognized', function(e){
    	var message = {
			type: 'unrecognizedSms',
			phoneNumber: e.phoneNumber,
			message: e.message
    	};
	    broadcast(message);
	});

	taxiMachine.bind(function (event, oldState, newState) {
	    var parameters = {};
	    if (newState == 'AWAITING_TAXI')
	    {
    		parameters.orderNumber = this.orderNumber;
	    }
	    else if(newState == 'TAXI_CONFIRMED')
	    {
	    	parameters.taxiNumber = this.taxiNumber;
	    }

	    var message = {
	    	type: 'transition',
	    	oldState: oldState,
	    	newState: newState,
	    	parameters: parameters
	    };
	    
	    broadcast(message);
	});
}

module.exports = webSocketNotifier;