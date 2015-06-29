$(function() {
	var socketUrl = 'ws://' + location.hostname + ':8081';
	var socket;

	var tryConnect = function() {
		socket = new WebSocket(socketUrl);

		socket.onopen = function() {
			console.log('WebSocket connection to ' + socketUrl + ' is opened');
		};

		socket.onclose = function(event) {
		    tryConnect();
			
			console.log('WebSocket connection to ' + socketUrl + ' is closed. Code: ' + event.code + '. Reason: ' + event.reason);
		};

		socket.onerror = function(error) {
			console.log('WebSocket connection error: ' + error.message);
		};

		socket.onmessage = function(e) {
			var data = JSON.parse(e.data);

			if(data.type == 'config')
			{
				futu.calendar.getInstance().start(data.config.calendar);
				futu.schedule.getInstance().start(data.config.schedule);
				futu.taxi.getInstance().start(data.config.taxiMachine);
			}
			else if(data.type == 'transition')
			{
				futu.taxi.getInstance().transition(data);
			}
			else if(data.type == 'unrecognizedSms')
			{
				console.log('Unrecognized SMS message from ' + data.phoneNumber + ' "' + data.message + '"');
			}
		};
	};

    tryConnect();
});
