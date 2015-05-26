var Gpio = require('onoff').Gpio;
var button = new Gpio(18, 'in', 'both');
var i = 0;

(function readInput() {
    setInterval(function() {
        button.read(function(err, value) {
            console.log(i++ + ' Value: ' + value);
        });
    }, 1000);
})();

process.on('SIGINT', function(){
    button.unexport();
    process.exit();
});