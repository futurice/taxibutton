var util = require('util');
var config = require('./config');
var Stately = require('stately.js');

var factory = {
    create: function(button, taxiService){
        var machine = Stately.machine({
            'IDLE': {
                buttonPressed: 'PRESSED'
            },
            'DEBOUNCE' : {
                debounceTimeout: function(){
                    return this.IDLE;
                }
            },
            'PRESSED': {
                buttonReleased: function (durationMs) {
                    return durationMs < config.button.minPressIntervalMs ? this.DEBOUNCE : this.ORDERING;
                }
            },
            'ORDERING': {
                buttonPressed: 'PRESSED',
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

        button.on('pressed', function(){
            machine.buttonPressed();
        });
        button.on('released', function(e){
            machine.buttonReleased(e.durationMs);
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