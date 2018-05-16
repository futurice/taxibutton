(function(futu, $, undefined) {
    futu.schedule = (function () {
        var instance;
        var config;
        var secrets;
        var refreshTimeoutObject;
        var removePastDepaturesTimeoutObject;
        var switchStopsCounter;
        var switchStopsTimeoutObject;
        var $schedule;
        var stopTemplate;
        var depatureTemplate;

        var render = function() {
            getStopsDataAsync(config.stopCodes)
                .done(function(data) {
                    var results = data.data.stops;
                    var templatesData = _.chain(results)
                        .map(function(x, index) {
                            return {
                                index: index,
                                stopName: x.name
                            }
                        })
                        .reverse()
                        .value();

                    var html = futu.templates.renderMany(stopTemplate, templatesData);
                    $schedule.find('.left .wrapper').html(html);
                    updateDeparturesHtml(results);

                    switchStopsCounter = -1;
                    switchStops();
                    switchStopsTimeoutObject = setInterval(switchStops, config.switchStopsInterval);
                });
        };

        var refresh = function() {
            getStopsDataAsync(config.stopCodes)
                .done(function(data) {
                    var results = data.data.stops;
                    updateDeparturesHtml(results);
                });
        };

        var getStopsDataAsync = function(stopCodes) {
            return $.ajax({url: config.apiUrl, type:"POST", data: JSON.stringify({"query": "{ stops(ids: " + JSON.stringify(stopCodes) + "){ name stoptimesWithoutPatterns(numberOfDepartures: 20) { scheduledArrival realtimeArrival arrivalDelay scheduledDeparture realtimeDeparture departureDelay realtime realtimeState serviceDay headsign trip { route { shortName } } } } }" } ), contentType: "application/json", dataType:"json"});
        };

        var updateDeparturesHtml = function(stopResults) {
            _.each(stopResults, function(stopArray, stopIndex) {
                var departures = stopArray.stoptimesWithoutPatterns;

                var templatesData = _.chain(departures)
                    .map(function (x) {
                        return _.extend({
                            moment: moment().clone().startOf('day').add(x.scheduledDeparture,'seconds')
                        }, x);
                    })
                    .sortBy(function(x){return x.moment})
                    .map(function(x) {
                        return {
                            lineCodeShort: x.trip.route.shortName,
                            lineEnd: x.headsign,
                            formattedTime: x.moment.format('HH:mm'),
                            isoDateTime: x.moment.toISOString()
                        };
                    })
                    .value();

                var html = futu.templates.renderMany(depatureTemplate, templatesData);
                $schedule.find('.stop-' + stopIndex + ' .body').html(html);
            });
        };

        var switchStops = function() {
            switchStopsCounter = (switchStopsCounter + 1) % config.stopCodes.length;

            $schedule.find('.left .stop').removeClass('selected');
            $schedule.find('.left .stop-' + switchStopsCounter).addClass('selected');

            $schedule.find('.right .map').removeClass('selected');
            $schedule.find('.right .map-' + switchStopsCounter).addClass('selected');

            $schedule.find('.right .map .icon').removeClass('selected');
            $schedule.find('.right .map .icon-' + switchStopsCounter).addClass('selected');
        };

        var removePastDepatures = function() {
            $schedule.find('.body tr').each(function() {
                var now = moment().add(-1, 'm');
                var departure = moment($(this).data('isoDateTime'));
                if(now < departure) return;

                $(this).fadeOut({
                    duration: 500,
                    done: function() {
                        $(this).remove();
                    }
                });
            });
        };

        function init() {
            return {
                start: function (options, secret_options) {
                    config = options;
                    secrets = secret_options;

                    $schedule = $('#schedule');

                    stopTemplate = futu.templates.find('#schedule-stop-template');
                    depatureTemplate = futu.templates.find('#schedule-depature-template');

                    render();
                    clearTimeout(refreshTimeoutObject);
                    refreshTimeoutObject = setInterval(refresh, config.refreshInterval);

                    clearTimeout(removePastDepaturesTimeoutObject);
                    removePastDepaturesTimeoutObject = setInterval(removePastDepatures, config.removePastDepaturesInterval);

                    clearTimeout(switchStopsTimeoutObject);
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
