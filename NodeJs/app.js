var config = require('./config');
var loggerClass = require('./logger')
var logger = new loggerClass(config.logging.level);
logger.info('Starting...');

var util = require('util');

/* -------------------------------- */

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
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
    logger.info('Http server listening at %s:%s', address.address, address.port);
});

/* -------------------------------- */

var smsGateClass = require('./smsGate');
var smsGate = new smsGateClass(config.smsGate);
smsGate.on('sent', function(e){
    logger.info('Sent SMS to %s "%s"', e.phoneNumber, e.message);
});
smsGate.on('received', function(e){
    logger.info('Received SMS from %s "%s"', e.phoneNumber, e.message);
});
smsGate.on('sending-error', function(e){
    logger.error('Failed sending SMS to %s "%s": %s', e.phoneNumber, e.message, e.innerError.message);
});

/* -------------------------------- */

var taxiServiceClass = require('./taxiService');
var taxiService = new taxiServiceClass(smsGate, config.taxiService);
taxiService.on('unknown', function(e){
    logger.warning('TaxiService unknown message from %s "%s"', e.phoneNumber, e.message);
});

/* -------------------------------- */

var buttonClass = require('./button');
var button = new buttonClass(config.button);
button.on('up', function(e){
    logger.debug('Button was down for ' + e.durationMs + 'ms');
});

/* -------------------------------- */

var taxiMachineFactory = require('./taxiMachine');
var taxiMachine = taxiMachineFactory.create(button, taxiService, config.taxiMachine);
taxiMachine.bind(function (event, oldState, newState) {
    logger.info(oldState + ' => ' + newState);
});

/* -------------------------------- */

var ws = require('nodejs-websocket');
var wsServer = ws.createServer(function (connection) {
    logger.info('New WebSocket connection from %s:%s', connection.socket.remoteAddress, connection.socket.remotePort);
}).listen(config.webSocketServer.port, function(){
    var address = wsServer.socket.address();
    logger.info('WebSocket server listening at %s:%s', address.address, address.port);
});

var webSocketNotifierClass = require('./webSocketNotifier');
var webSocketNotifier = new webSocketNotifierClass(wsServer, taxiService, taxiMachine);

/* -------------------------------- */

process.on('SIGINT', function(){
    button.unexport();
    process.exit();
});