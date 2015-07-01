(function(futu, $, undefined) {
    futu.schedule = (function () {
        var instance;
        var config;
        var refreshTimeoutObject;
        var removePastDepaturesTimeoutObject;
        var switchStopsTimeoutObject;
        var $schedule;
        var stopTemplate;
        var depatureTemplate;
        var linesCache;

        var render = function() {
            getStopsDataAsync(config.stopCodes)
                .done(function() {
                    var results = _.map(arguments, function(x){return JSON.parse(x[0])});
                    var templatesData = _.map(results, function(x, index) {
                        return {
                            index: index,
                            stopName: x[0].name_fi
                        }
                    });

                    var html = futu.templates.renderMany(stopTemplate, templatesData);
                    $schedule.find('.left .wrapper').html(html);
                    updateDeparturesHtml(results);
                });
        };

        var refresh = function() {
            getStopsDataAsync(config.stopCodes)
                .done(function() {
                    var results = _.map(arguments, function(x){return JSON.parse(x[0])});
                    updateDeparturesHtml(results);
                });
        };

        var getStopsDataAsync = function(stopCodes) {
            return $.whenAll(_.map(stopCodes, function(code) {
                return $.get(config.apiUrl, {
                    request: 'stop',
                    format: 'json',
                    user: config.username,
                    pass: config.password,
                    code: code,
                    dep_limit: 20,
                    time_limit: 360,
                    p: '1110000000100000000'
                });
            }));
        };

        var updateDeparturesHtml = function(stopResults) {
            _.each(stopResults, function(stopArray, stopIndex) {
                var departures = _.reduce(stopArray, function(memo, x) {
                    return memo.concat(x.departures);
                }, []);

                var lineCodes = _.chain(departures).map(function(x){return x.code}).uniq().value();
                getLinesAsync(lineCodes)
                    .done(function(lines){
                        var templatesData = _.chain(departures)
                            .map(function (x) {
                                return _.extend({
                                    moment: moment({year: x.date / 10000 >> 0, month: ((x.date / 100 >> 0) % 100) - 1, day: x.date % 100, hour: x.time / 100 >> 0, minute: x.time % 100 })
                                }, x);
                            })
                            .sortBy(function(x){return x.moment})
                            .map(function(x) {
                                return {
                                    lineCodeShort: lines[x.code].code_short,
                                    lineEnd: lines[x.code].line_end,
                                    formattedTime: x.moment.format('HH:mm'),
                                    isoDateTime: x.moment.toISOString()
                                };
                            })
                            .value();

                        var html = futu.templates.renderMany(depatureTemplate, templatesData);
                        $schedule.find('.stop-' + stopIndex + ' .body').html(html);
                    });
            });
        };

        var getLinesAsync = function(lineCodes, callback) {
            var deferred = $.Deferred();

            var missingLineCodes = _.difference(lineCodes, _.keys(linesCache));
            if (missingLineCodes.length > 0)
            {
                $.whenAll(_.map(lineCodes, function(code){
                    return $.get(config.apiUrl, {
                        request: 'lines',
                        format: 'json',
                        user: config.username,
                        pass: config.password,
                        query: code,
                        p: '11111'
                    });
                })).done(function(){
                    var results = _.map(arguments, function(x){return JSON.parse(x[0])[0]});
                    var lines = _.object(lineCodes, results);
                    _.extend(linesCache, lines);
                    deferred.resolve(linesCache);
                });
            }
            else
            {
                deferred.resolve(linesCache);
            }

            return deferred;
        };

        var removePastDepatures = function() {
            $schedule.find('.body tr').each(function() {
                var now = moment().add(-1, 'm');
                var departure = moment($(this).data('isoDateTime'));
                if(now < departure) return;
                
                $(this).remove();
            });
        };

        var switchStopsCounter;
        var switchStops = function(argument) {
            switchStopsCounter = (switchStopsCounter + 1) % config.stopCodes.length;

            var halfWidth = $schedule.width() / 2;
            $schedule.find('.left .wrapper').animate({
                left: -halfWidth + 'px',
            }, {
                duration: 1000,
                done: function() {
                    var $this = $(this);
                    $this.css('left', '0');
                    $this.append($this.children()[0]);
                }
            });

            $schedule.find('.right .map').animate({
                left: -((switchStopsCounter / 2 >> 0) * halfWidth) + 'px',
            }, {
                duration: 1000,
            });
        };

        function init() {
            return {
                start: function (options) {
                    config = options;

                    $schedule = $('#schedule');

                    stopTemplate = futu.templates.find('#schedule-stop-template');
                    depatureTemplate = futu.templates.find('#schedule-depature-template');
                    linesCache = {};

                    render();
                    clearTimeout(refreshTimeoutObject);
                    refreshTimeoutObject = setInterval(refresh, config.refreshInterval);

                    clearTimeout(removePastDepaturesTimeoutObject);
                    removePastDepaturesTimeoutObject = setInterval(removePastDepatures, config.removePastDepaturesInterval);

                    switchStopsCounter = 0;
                    clearTimeout(switchStopsTimeoutObject);
                    switchStopsTimeoutObject = setInterval(switchStops, config.switchStopsInterval);
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