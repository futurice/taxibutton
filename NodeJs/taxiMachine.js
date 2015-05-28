var util = require('util');
var Stately = require('stately.js');

var factory = {
    create: function(button, taxiService, options){
        var machine = Stately.machine({
            'IDLE': {
                buttonDown: function () {
                    clearStateTimeout(this);
                    return this.PRESSED;
                }
            },
            'PRESSED': {
                buttonUp: function (durationMs) {
                    if(durationMs < options.minPressDuration)
                    {
                        return this.IDLE;
                    }
                    
                    taxiService.sendOrder();
                    setStateTimeout(this, machine.orderingTaxiTimeout, options.orderingTaxiTimeout);
                    return this.ORDERING_TAXI;
                }
            },
            'ORDERING_TAXI': {
                orderConfirmed: function (orderNumber) {
                    this.orderNumber = orderNumber;
                    setStateTimeout(this, machine.awaitingTaxiTimeout, options.awaitingTaxiTimeout);
                    return this.AWAITING_TAXI;
                },
                taxiConfirmed: function (taxiNumber) {
                    this.taxiNumber = taxiNumber;
                    setStateTimeout(this, machine.taxiConfirmedTimeout, options.taxiConfirmedTimeout);
                    return this.TAXI_CONFIRMED;
                },
                allBusy: function () {
                    setStateTimeout(this, machine.allBusyTimeout, options.allBusyTimeout);
                    return this.ALL_BUSY;
                },
                orderingTaxiTimeout: function(){
                    setStateTimeout(this, machine.orderFailedTimeout, options.orderFailedTimeout);
                    return this.ORDER_FAILED;
                }
            },
            'AWAITING_TAXI': {
                taxiConfirmed: function (taxiNumber) {
                    return this.ORDERING_TAXI.taxiConfirmed.call(this, taxiNumber);
                },
                allBusy: function () {
                    return this.ORDERING_TAXI.allBusy.call(this);
                },
                awaitingTaxiTimeout: function() {
                    return this.ORDERING_TAXI.orderingTaxiTimeout.call(this);
                }
            },
            'TAXI_CONFIRMED': {
                buttonDown: function () {
                    return this.IDLE.buttonDown.call(this);
                },
                taxiConfirmedTimeout: function() {
                    return this.IDLE;
                }
            },
            'ALL_BUSY': {
                buttonDown: function () {
                    return this.IDLE.buttonDown.call(this);
                },
                allBusyTimeout: function () {
                    return this.IDLE;
                }
            },
            'ORDER_FAILED': {
                buttonDown: function () {
                    return this.IDLE.buttonDown.call(this);
                },
                orderFailedTimeout: function () {
                    return this.IDLE;
                }
            },
        });

        var clearStateTimeout = function (stateStore) {
            clearTimeout(stateStore.stateTimeoutObject);
        };

        var setStateTimeout = function(stateStore, action, timeout){
            clearTimeout(stateStore.stateTimeoutObject);
            stateStore.stateTimeoutObject = setTimeout(function(){
                action();
            }, timeout);
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