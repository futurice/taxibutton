(function(futu, $, undefined) {
    futu.weather = (function () {
        var instance;
        var config;
        var refreshTimeoutObject;
        
        var formatTemperature = function(temperature) {
            var round = temperature.toFixed(1);
            return round > 0 ? '+' + round : round.toString();
        };

        function init() {
            return {
                start: function (options) {
                    config = options;

                    clearTimeout(refreshTimeoutObject);
                    refresh();
                    refreshTimeoutObject = setInterval(refresh, config.refreshInterval);
                },
            };
        };

        function refresh() {
            $.when.apply($, _.map(config.queries, function(query){
                return $.get('http://api.openweathermap.org/data/2.5/weather', {
                    APPID: config.apikey,
                    q: query,
                    units: 'metric'
                });
            })).done(function(){
                var results = _.map(arguments, function(x){return x[0]});
                var templatesData = _.map(results, function(x) {
                    return {
                        city: x.name,
                        temperature: formatTemperature(x.main.temp),
                        icon: 'http://openweathermap.org/img/w/' + x.weather[0].icon + '.png'
                    };
                });
                
                var itemTemplate = futu.templates.find('#weather-item-template');
                var itemsHtml = futu.templates.renderMany(itemTemplate, templatesData);
                $('.weather table').html(itemsHtml);
            });
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