var util = require('util');
var config = require('./config');
var Stately = require('stately.js');

var factory = {
    create: function(button, taxiService){
        var machine = Stately.machine({
            'IDLE': {
                buttonDown: 'PRESSED'
            },
            'PRESSED': {
                buttonUp: function (durationMs) {
                    return durationMs < config.button.minPressIntervalMs ? this.IDLE : this.ORDERING;
                }
            },
            'ORDERING': {
                buttonDown: 'PRESSED',
            }
        });

        machine.onenterORDERING = function (event, oldState, newState) {
            taxiService.sendOrder();
        };

        button.on('down', function(e){
            machine.buttonDown();
        });
        button.on('up', function(e){
            machine.buttonUp(e.durationMs);
        });

        taxiService.on('orderConfirmed', function(e){
            machine.orderConfirmed(e.orderNumber);
        });
        taxiService.on('taxiConfirmed', function(e){
            machine.taxiConfirmed(e.taxiNumber);
        });
        taxiService.on('allBusy', function(e){
            machine.allBusy();
        });

        return machine;
    }
}

module.exports = factory;