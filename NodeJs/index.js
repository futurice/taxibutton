var config = require('./config');
var taxiMachine = require('./taxiMachine');
var util = require('util');
var ws = require('nodejs-websocket');
var Gpio = require('onoff').Gpio;
var button = new Gpio(config.button.pin, 'in', 'both');

(function(){
    util.log("Initializing...");

    var server = ws.createServer(function (connection) {
        util.log("New connection");
    }).listen(config.websocket.port, function(){
        util.log("Started WebSocket server on port " + config.websocket.port);
    });

    button.watch(function(err, value){
        if (err) throw err;
        
        if(value)
        {
            taxiMachine.buttonReleased(function(ms) {util.log('Button was pressed for ' + ms + 'ms')});
        }
        else
        {
            taxiMachine.buttonPressed();
        }
    });

    taxiMachine.bind(function (event, oldState, newState) {
        var transition = oldState + ' => ' + newState;
        util.log(transition);

        server.connections.forEach(function (connection) {
            connection.sendText(transition);
        });
    });
})();

process.on('SIGINT', function(){
    button.unexport();
    process.exit();
});