var util = require('util');
util.log('INFO - Starting...');

var config = require('./config');

/* -------------------------------- */

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var express = require('express');
var app = express();
app.use(express.static('public'));

app.post('/sms/send', urlencodedParser, function (req, res) {
    smsGate.send(req.body.phoneNumber, req.body.message);
    res.end();
});

app.get('/sms/receive', function (req, res) {
    smsGate.receive(req.query.phoneNumber, req.query.message);
    res.end();
});

var appServer = app.listen(config.httpServer.port, function () {
    var address = appServer.address();
    util.log('INFO - Http server listening at %s:%s', address.address, address.port);
});

/* -------------------------------- */

var ws = require('nodejs-websocket');
var wsServer = ws.createServer(function (connection) {
    util.log('INFO - New WebSocket connection from %s:%s', connection.socket.remoteAddress, connection.socket.remotePort);
}).listen(config.webSocketServer.port, function(){
    var address = wsServer.socket.address();
    util.log('INFO - WebSocket server listening at %s:%s', address.address, address.port);
});

/* -------------------------------- */

var smsGateClass = require('./smsGate');
var smsGate = new smsGateClass();
smsGate.on('sent', function(e){
    util.log('INFO - Sent SMS to %s "%s"', e.phoneNumber, e.message);
});
smsGate.on('received', function(e){
    util.log('INFO - Received SMS from %s "%s"', e.phoneNumber, e.message);
});
smsGate.on('sending-error', function(e){
    util.log('ERROR - sending SMS to %s "%s": %s', e.phoneNumber, e.message, e.innerError.message);
});

/* -------------------------------- */

var taxiServiceClass = require('./taxiService');
var taxiService = new taxiServiceClass(smsGate);
taxiService.on('orderConfirmed', function(e){
    taxiMachine.orderConfirmed(e.orderNumber);
    util.log('DEBUG - Order confirmed #%s', e.orderNumber);
});
taxiService.on('taxiConfirmed', function(e){
    taxiMachine.taxiConfirmed(e.taxiNumber);
    util.log('DEBUG - Taxi confirmed #%s', e.taxiNumber);
});
taxiService.on('allBusy', function(e){
    taxiMachine.allBusy();
    util.log('DEBUG - All taxis are busy');
});
taxiService.on('unknown', function(){
    broadcast(util.format('Unknown SMS message from %s "%s"', e.phoneNumber, e.message));
    util.log('DEBUG - TaxiService unknown message from %s "%s"', e.phoneNumber, e.message);
});

/* -------------------------------- */

var Gpio = require('onoff').Gpio;
var gpioPin = new Gpio(config.button.pin, 'in', 'both');
var buttonClass = require('./button');
var button = new buttonClass(gpioPin);
button.on('released', function(e){
    util.log('DEBUG - Button was pressed for ' + e.durationMs + 'ms');
});

/* -------------------------------- */

var taxiMachineFactory = require('./taxiMachine');
var taxiMachine = taxiMachineFactory.create(button, taxiService);
taxiMachine.bind(function (event, oldState, newState) {
    var transition = oldState + ' => ' + newState;
    broadcast(transition);
    util.log('INFO - ' + transition);
});

/* -------------------------------- */

function broadcast(message)
{
    wsServer.connections.forEach(function (connection) {
        connection.sendText(message);
    });
}

process.on('SIGINT', function(){
    gpioPin.unexport();
    process.exit();
});