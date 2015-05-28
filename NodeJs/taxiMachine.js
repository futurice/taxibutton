var util = require('util');
var config = require('./config');
var Stately = require('stately.js');

var factory = {
    create: function(button, taxiService){
        var machine = Stately.machine({
            'IDLE': {
                buttonDown: 'PRESSED'
            },
            'DEBOUNCE' : {
                debounceTimeout: function(){
                    return this.IDLE;
                }
            },
            'PRESSED': {
                buttonUp: function (durationMs) {
                    return durationMs < config.button.minPressIntervalMs ? this.DEBOUNCE : this.ORDERING;
                }
            },
            'ORDERING': {
                buttonDown: 'PRESSED',
            }
        });

        machine.onenterORDERING = function (event, oldState, newState) {
            taxiService.sendOrder();
        };

        machine.onenterDEBOUNCE = function (event, oldState, newState) {
            setTimeout(function() {
                machine.debounceTimeout();
            }, config.button.debouceInterval);
        };

        button.on('down', function(){
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
        taxiService.on('allBusy', function(){
            machine.allBusy();
        });

        return machine;
    }
}

module.exports = factory;