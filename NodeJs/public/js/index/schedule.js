(function(futu, $, undefined) {
    futu.schedule = (function () {
        var instance;
        var config;
        var refreshTimeoutObject;
        var $schedule;
        var depatureTemplate;
        var linesCache;

        var refresh = function() {
            updateDeparturesHtmlAsync(config.busStopCodes, $schedule.find('.buses.body'));
            updateDeparturesHtmlAsync(config.tramStopCodes, $schedule.find('.trams.body'));
        };

        var updateDeparturesHtmlAsync = function(stopCodes, $parentElement) {
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
            })).done(function(){
                var results = _.map(arguments, function(x){return JSON.parse(x[0])[0]});
                var departures = _.reduce(results, function(memo, x) {
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
                            .sortBy(function(x){return x.dateTime})
                            .map(function(x) {
                                return {
                                    lineCodeShort: lines[x.code].code_short,
                                    lineEnd: lines[x.code].line_end,
                                    formattedTime: x.moment.format('HH:mm'),
                                    isoDateTime: x.moment.toISOString()
                                };
                            })
                            .value();

                        var departuresHtml = futu.templates.renderMany(depatureTemplate, templatesData);
                        $parentElement.html(departuresHtml);
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

        var formatTime = function(hours, minutes) {
            return hours + ':' + (minutes < 10 ? '0' : '') + minutes;
        };

        var removePastDepatures = function() {
            $schedule.find('.body tr').each(function() {
                var now = moment().add(-1, 'm');
                var departure = moment($(this).data('isoDateTime'));
                if(now < departure) return;
                
                $(this).hide(400, function() {
                    $(this).remove();
                });
            });
        };

        function init() {
            return {
                start: function (options) {
                    config = options;

                    $schedule = $('#schedule');

                    depatureTemplate = futu.templates.find('#schedule-depature-template');
                    linesCache = {};

                    clearTimeout(refreshTimeoutObject);
                    refresh();
                    refreshTimeoutObject = setInterval(refresh, config.refreshInterval);

                    setInterval(removePastDepatures, config.pastFilteringInterval);
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