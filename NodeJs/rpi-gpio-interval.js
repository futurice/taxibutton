var gpio = require('rpi-gpio');

gpio.setup(18, gpio.DIR_IN, readInput);
 
function readInput() {
    setInterval(function() {
        gpio.read(18, function(err, value) {
            console.log('The value is ' + value);
        });
    }, 1000);
}