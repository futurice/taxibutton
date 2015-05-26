var config = require('./config');
var util = require('util');
var Stately = require('stately.js');

module.exports = Stately.machine({
    'IDLE': {
        buttonPressed: function () {
            this.buttonPressedTime = process.hrtime();
            return this.PRESSED;
        }
    },
    'PRESSED': {
        buttonReleased: function () {
            var ms = hrtimeToMs(process.hrtime(this.buttonPressedTime));

            util.log('Press duration: ' + ms + 'ms')

            return ms < config.button.minPressDurationMs ? this.IDLE : this.ORDERING;
        }
    },
    'ORDERING': {
        buttonPressed: function () {
            this.buttonPressedTime = process.hrtime();
            return this.PRESSED;
        }
    }
}).bind(function (event, oldState, newState) {
    var transition = oldState + ' => ' + newState;
    util.log(transition);
});

function hrtimeToMs(hrtime)
{
    return hrtime[0] * 1e3 + hrtime[1] * 1e-6;
}