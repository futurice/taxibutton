(function(futu, $, undefined) {
    futu.taxi = (function () {
        var instance;
        var config;
        var $frames;
        var $overlays;
        var orderNumber;
        var pressedCounterTimeoutObject;
        var overlayTimeoutObject;

        var showFrame = function (frameClass) {
            $frames.find('.frame').css('display', 'none');
            $frames.find('.frame.' + frameClass).css('display', 'table-cell');
        };

        var showOverlay = function (overlayClass, timeout) {
            clearTimeout(overlayTimeoutObject);

            $overlays.find('.overlay').css('display', 'none');
            var $overlay = $overlays.find('.overlay.' + overlayClass);
            
            $overlay.css('display', 'table-cell');
            overlayTimeoutObject = setTimeout(function(){
                $overlay.fadeOut(2000);
            }, timeout);
        };

        var newStateFunctions = {
            'IDLE': function(t) {showFrame('idle');},
            'PRESSED': function(t) {
                var counter = (config.pressedTimeout / 1000).toFixed(0);

                $frames.find('.frame.pressed .cap').text(counter);
                var $counter = $frames.find('.frame.pressed .counter');
                $counter.text('00:0' + counter);
                
                clearTimeout(pressedCounterTimeoutObject);
                pressedCounterTimeoutObject = setInterval(function() {
                    $counter.text('00:0' + (--counter));
                    if (counter == 0) {
                        clearTimeout(pressedCounterTimeoutObject);
                    };
                }, 1000);

                showFrame('pressed');
            },
            'QUICKIE': function(t) {showFrame('quickie');},
            'ORDERING_TAXI': function(t) {showFrame('ordering-taxi');},
            'AWAITING_TAXI': function(t) {
                orderNumber = t.parameters.orderNumber;
                showFrame('awaiting-taxi');
            },
            'TAXI_CONFIRMED': function(t) {
                var $frame = $frames.find('.frame.taxi-confirmed');
                $frame.find('.order-number').text(orderNumber);
                $frame.find('.taxi-number').text(t.parameters.taxiNumber);
                showFrame('taxi-confirmed');

                var $previousTaxi = $frames.find('.frame.idle .previous-taxi');
                $previousTaxi.find('.order-number').text(orderNumber);
                $previousTaxi.find('.taxi-number').text(t.parameters.taxiNumber);
                $previousTaxi.show();
                setTimeout(function(){
                    $previousTaxi.fadeOut(2000);
                }, config.previousTaxiTimeout);
            },
            'ALL_BUSY': function(t) {showFrame('all-busy');},
            'ORDER_FAILED': function(t) {showFrame('order-failed');}
        };

        function init() {
            return {
                start: function (options) {
                    config = options;
                    config.previousTaxiTimeout = config.taxiConfirmedTimeout + 60 * 1000;
                    config.unrecognizedSmsTimeout = 30 * 1000;

                    $frames = $('#taxi .frames');
                    $overlays = $('#taxi .overlays');
                },
                transition: function (data) {
                    newStateFunctions[data.newState](data);
                },
                unrecognizedSms: function (data) {
                    var $overlay = $overlays.find('.overlay.unrecognized-sms');
                    $overlay.find('.message').text(data.message);
                    $overlay.find('.phone-number').text(data.phoneNumber);
                    showOverlay('unrecognized-sms', config.unrecognizedSmsTimeout);
                }
            };
        };
         
        return {
            getInstance: function () {
                if (!instance)
                {
                    instance = init();
                }
                return instance;
            }
        };
    })();
}(window.futu = window.futu || {}, jQuery));