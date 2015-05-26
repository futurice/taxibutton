var gpio = require('pi-gpio');
var pin = 18;

gpio.open(pin, "input pullup", readInput);
 
function readInput() {
    setInterval(function() {
        gpio.read(pin, function(err, value) {
            console.log('The value is ' + value);
        });
    }, 1000);
}

//process.on('SIGINT', function(){
    gpio.close(pin);
//});