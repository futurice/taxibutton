var util = require('util');
var events = require('events');
var Gpio = require('onoff').Gpio;
var config = require('./config');

function button() {
	var that = this;
	var gpioPin = new Gpio(config.button.pin, 'in', 'both');
	var pressedTime = process.hrtime();
	var isPressed = false;

	gpioPin.watch(function(err, value){
        if (err) throw err;
        
        if(value && isPressed)
        {
            var duration = process.hrtime(pressedTime);
            var ms = hrtimeToMs(duration);
            isPressed = false;
	 		that.emit('up', {durationMs: ms});
        }
        else if(!value && isPressed === false)
        {
        	pressedTime = process.hrtime();
        	isPressed = true;
	 		that.emit('down');
        }
    });

	events.EventEmitter.call(this)
}

util.inherits(button, events.EventEmitter);
module.exports = button;

function hrtimeToMs(hrtime)
{
    return hrtime[0] * 1e3 + hrtime[1] * 1e-6;
}