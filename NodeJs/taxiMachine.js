var config = require('./config');
var Stately = require('stately.js');

var machine = Stately.machine({
    'IDLE': {
        buttonPressed: buttonPressedHandler
    },
    'DEBOUNCE' : {
        debounceTimeout: function(){
            return this.IDLE;
        }
    },
    'PRESSED': {
        buttonReleased: function (callback) {
            var interval = process.hrtime(this.buttonPressedTime);
            var ms = hrtimeToMs(interval);
            callback(ms);

            return ms < config.button.minPressIntervalMs ? this.DEBOUNCE : this.ORDERING;
        }
    },
    'ORDERING': {
        buttonPressed: buttonPressedHandler,
    }
});

machine.onenterDEBOUNCE = function (event, oldState, newState) {
    setTimeout(function() {
        machine.debounceTimeout();
    }, config.button.debouceInterval);
};

module.exports = machine;

function buttonPressedHandler()
{
    this.buttonPressedTime = process.hrtime();
    return this.PRESSED;
}

function hrtimeToMs(hrtime)
{
    return hrtime[0] * 1e3 + hrtime[1] * 1e-6;
}