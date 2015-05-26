var Gpio = require('onoff').Gpio;
var button = new Gpio(18, 'in', 'both');
var i = 0;

button.watch(function(err, value){
    if (err) throw err;
    console.log(i++ + ' Value: ' + value);
});

process.on('SIGINT', function(){
    button.unexport();
    process.exit();
});