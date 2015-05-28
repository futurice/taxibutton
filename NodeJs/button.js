var util = require('util');
var events = require('events');
var Gpio = require('onoff').Gpio;

function button(options) {
	var that = this;
	var gpioPin = new Gpio(options.pin, 'in', 'both');
	var lastWatchTime = process.hrtime();
	var lastValue = 0;
	var timeoutObject = null;

	gpioPin.watch(function(err, value){
        if (err) throw err;
        value = value ? 0 : 1;

    	if(lastValue != value && timeoutObject == null)
    	{
    		timeoutObject = setTimeout(function() {
				lastValue = !lastValue;

            	var duration = process.hrtime(lastWatchTime);
             	var ms = hrtimeToMs(duration);
         		lastWatchTime = process.hrtime();

	 			that.emit(lastValue ? 'down' : 'up', {durationMs: ms});

 				timeoutObject = null;
    		}, options.debounceTimeout);
    	}
    	else if (lastValue == value && timeoutObject != null)
    	{
			clearTimeout(timeoutObject);
			timeoutObject = null;
    	}
    });

    this.unexport = function(){
		gpioPin.unexport();
    };

	events.EventEmitter.call(this)
}

util.inherits(button, events.EventEmitter);
module.exports = button;

function hrtimeToMs(hrtime)
{
    return hrtime[0] * 1e3 + hrtime[1] * 1e-6;
}