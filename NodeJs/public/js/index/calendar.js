(function(futu, $, undefined) {
    futu.calendar = (function () {
        var instance;
        var config;
        var weatherRefreshTimeoutObject;
        var timeRefreshTimeoutObject;
        var thisPlaceLastNow;
        var $calendar;
        var $ticker;
        var dayNumberTemplate;
        var thisPlaceWeatherTemplate;
        var tickerTemplate;
        var tickerItemTemplate;
        
        var formatTemperature = function(temperature) {
            var round = temperature.toFixed(0);
            return round > 0 ? '+' + round : round.toString();
        };

        var renderCalendar = function() {
            var thisPlace = _.first(config.places);
            $calendar.find('.this-place .name').text(thisPlace.name);

            var restPlaces = _.rest(config.places, 1);
            var tickerItemsData = _.map(restPlaces, function(place, index){
                return {
                    index: index,
                    name: place.name,
                    time: '00:00',
                    temperature: 0,
                };
            });
            var lineHtml = futu.templates.renderMany(tickerItemTemplate, tickerItemsData, '&nbsp;&nbsp;/&nbsp;&nbsp;');
            $ticker.html(futu.templates.render(tickerTemplate, {lineHtml: lineHtml}));
        };

        var renderDayNumbers = function(now){
            var dayMoments = _.map(_.range(0, 8), function(offset){
                var cloneNow = moment(now);
                return cloneNow.add(offset, 'd');
            });
            var templateData = _.map(dayMoments, function (m, index) {
                var isoWeekday = m.isoWeekday();
                return {
                    dayOfMonth: m.format('DD'),
                    dayOfWeek: index == 0 ? m.format('ddd') : '',
                    weekendClass: isoWeekday == 6 || isoWeekday == 7 ? 'weekend' : ''
                };
            });
            var html = futu.templates.renderMany(dayNumberTemplate, templateData);
            $calendar.find('.weekdays').html(html);
        };

        var timeRefresh = function() {
            var now = moment();

            var thisPlace = _.first(config.places);
            var thisPlaceNow = now.tz(thisPlace.timezone);
            $calendar.find('.current-time').text(thisPlaceNow.format('HH:mm'));
            if(thisPlaceNow.date() != thisPlaceLastNow.date())
            {
                renderDayNumbers(thisPlaceNow);
            }
            thisPlaceLastNow = thisPlaceNow;

            var restPlaces = _.rest(config.places, 1);
            _.each(restPlaces, function(place, index) {
                $ticker.find('span.place-' + index + ' .time').text(now.tz(place.timezone).format('HH:mm'));
            });
        };

        var weatherRefresh = function() {
            $.whenAll(_.map(config.places, function(place){
                return $.get(config.weather.apiUrl, {
                    APPID: config.weather.apikey,
                    q: place.query,
                    units: 'metric'
                });
            })).done(function(){
                var results = _.map(arguments, function(x){return x[0]});
                
                var thisPlaceResult = _.first(results);
                var thisPlaceWeatherHtml = futu.templates.render(thisPlaceWeatherTemplate, {
                    temperature: formatTemperature(thisPlaceResult.main.temp),
                    icon: thisPlaceResult.weather[0].icon,
                });
                $calendar.find('.this-place .weather').html(thisPlaceWeatherHtml);

                var restResults = _.rest(results, 1);
                _.each(restResults, function(result, index) {
                    $ticker.find('span.place-' + index + ' .temperature').text(formatTemperature(result.main.temp));
                });
            });
        };

        function init() {
            return {
                start: function (options) {
                    config = options;

                    $calendar = $('#calendar');
                    $ticker = $('#calendar .ticker');
                    dayNumberTemplate = futu.templates.find('#calendar-day-number-template');
                    thisPlaceWeatherTemplate = futu.templates.find('#calendar-this-place-weather-template');
                    tickerTemplate = futu.templates.find('#calendar-ticker-template');
                    tickerItemTemplate = futu.templates.find('#calendar-ticker-item-template');
                    thisPlaceLastNow = moment(0);

                    renderCalendar();

                    clearTimeout(timeRefreshTimeoutObject);
                    timeRefresh();
                    timeRefreshTimeoutObject = setInterval(timeRefresh, 1000);

                    clearTimeout(weatherRefreshTimeoutObject);
                    weatherRefresh();
                    weatherRefreshTimeoutObject = setInterval(weatherRefresh, config.weather.refreshInterval);
                },
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