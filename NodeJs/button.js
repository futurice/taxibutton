var util = require('util');
var events = require('events');
var config = require('./config');

function button(gpioPin) {
	var that = this;
	var pressedTime = process.hrtime();
	var isPressed = false;

	gpioPin.watch(function(err, value){
        if (err) throw err;
        
        if(value && isPressed)
        {
            var duration = process.hrtime(pressedTime);
            var ms = hrtimeToMs(duration);
            isPressed = false;
	 		that.emit('released', {durationMs: ms});
        }
        else if(!value && isPressed === false)
        {
        	pressedTime = process.hrtime();
        	isPressed = true;
	 		that.emit('pressed');
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