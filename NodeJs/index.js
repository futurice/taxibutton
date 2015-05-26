var ws = require("nodejs-websocket");
var Gpio = require('onoff').Gpio;
var button = new Gpio(18, 'in', 'both');

var server = ws.createServer(function (connection) {
    console.log("New connection");
}).listen(8001, function(){
    console.log("Started WebSocket server");
});

function broadcast(message) {
    server.connections.forEach(function (connection) {
        connection.sendText(message);
    });
}

var i = 0;
button.watch(function(err, value){
    if (err) throw err;
    console.log(i++ + ' ' + (value ? "DOWN" : "UP"));
    broadcast(i + ' ' + (value ? "DOWN" : "UP"));
});

// (function readInput() {
//     setInterval(function() {
//         button.read(function(err, value) {
//             console.log(i++ + ' Value: ' + value);
//             broadcast(i + " Button " + (value ? "released" : "pressed"));
//         });
//     }, 1000);
// })();

process.on('SIGINT', function(){
    button.unexport();
    process.exit();
});