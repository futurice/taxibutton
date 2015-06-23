(function(futu, $, undefined) {
    futu.calendar = (function () {
        var instance;
        var config;
        var weatherRefreshTimeoutObject;
        var timeRefreshTimeoutObject;
        var $calendar;
        var $ticker;
        var dayNumberTemplate;
        var thisPlaceWeatherTemplate;
        var tickerItemTemplate;
        
        var formatTemperature = function(temperature) {
            var round = temperature.toFixed(0);
            return round > 0 ? '+' + round : round.toString();
        };

        var renderCalendar = function() {
            var thisPlace = _.first(config.places);
            $calendar.find('.this-place .name').text(thisPlace.name);

            var restPlaces = _.rest(config.places, 1);
            var tickerItemsData = _.map(restPlaces, function(place){
                return {
                    name: place.name,
                    time: '00:00',
                    temperature: 0,
                };
            });
            $ticker.html(futu.templates.renderMany(tickerItemTemplate, tickerItemsData, '&nbsp;/&nbsp;'));
        };

        var timeRefresh = function() {
            var now = moment();
            var format = 'HH:mm';

            var thisPlace = _.first(config.places);
            $calendar.find('.current-time').text(now.tz(thisPlace.timezone).format(format));

            var restPlaces = _.rest(config.places, 1);
            _.each(restPlaces, function(place, index) {
                $ticker.find('span:nth-of-type(' + (index + 1) + ') .time').text(now.tz(place.timezone).format(format));
            });
        };

        var weatherRefresh = function() {
            $.when.apply($, _.map(config.places, function(place){
                return $.get(config.weather.weatherApi, {
                    APPID: config.weather.apikey,
                    q: place.query,
                    units: 'metric'
                });
            })).done(function(){
                var results = _.map(arguments, function(x){return x[0]});
                
                var thisPlaceResult = _.first(results);
                var thisPlaceWeatherHtml = futu.templates.render(thisPlaceWeatherTemplate, {
                    temperature: formatTemperature(thisPlaceResult.main.temp),
                    icon: 'http://openweathermap.org/img/w/' + thisPlaceResult.weather[0].icon + '.png',
                });
                $calendar.find('.this-place .weather').html(thisPlaceWeatherHtml);

                var restResults = _.rest(results, 1);
                _.each(restResults, function(result, index) {
                    $ticker.find('span:nth-of-type(' + (index + 1) + ') .temperature').text(formatTemperature(result.main.temp));
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
                    tickerItemTemplate = futu.templates.find('#calendar-ticker-item-template');

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