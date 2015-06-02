$(function() {
    var socket = new WebSocket('ws://' + location.hostname + ':8081');
    
    socket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        //console.log(data);

        if(data.type == 'config')
        {
            futu.weather.getInstance().start(data.config.weather);
            futu.schedule.getInstance().start(data.config.schedule);
        }
        else if(data.type == 'unrecognizedSms')
        {
        	console.log('Unrecognized SMS message from ' + data.phoneNumber + ' "' + data.message + '"');
        }
    };
});
