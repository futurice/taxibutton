var config = require('./config');
var taxiFsm = require('./taxiFsm');
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
        
        var action = value ? taxiFsm.buttonReleased : taxiFsm.buttonPressed;
        action();
    });

    taxiFsm.bind(function (event, oldState, newState) {
        var transition = oldState + ' => ' + newState;
        
        server.connections.forEach(function (connection) {
            connection.sendText(transition);
        });
    });
})();

process.on('SIGINT', function(){
    button.unexport();
    process.exit();
});