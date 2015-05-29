$(function(){
    var WEATHER_REFRESH_TIMEOUT_MILLIS = 5*60*1000;
    var WEATHERBUG_API_CODE = 'A4673533785';
    var WEATHERBUG_BASE_URL = 'http://' + WEATHERBUG_API_CODE + '.api.wxbug.net/getLiveWeatherRSS.aspx';

    // Search city codes by 'http://a4673533785.api.wxbug.net/getLocationsXML.aspx?ACode=A4673533785&SearchString=<city name>'
    var CITY_CODES = {
        helsinki: 62073,
        tampere: 62152,
        berlin: 58439,
        london: 60876
    };
    
    function refreshWeatherForecastForCity(city) {
        $.get(WEATHERBUG_BASE_URL, {
            ACode: WEATHERBUG_API_CODE,
            unittype: 1,
            citycode: CITY_CODES[city]
        }, function(data) {
            var desc = $(data).find('item:first').find('description:first');
            // Turn the CDATA content into jQuery DOM object, wrapping it inside a div first to make find() work
            var descDOM = $('<div>' + desc.text() + '</div>');
            var img = descDOM.find('img:first');
            var imgUrl = img.length && img[0].src;
            // Extract temperatures
            var temp;
            var childNodes = descDOM[0].childNodes; // argh, need to use DOM here :(
            for (var i=0, length=childNodes.length, element; i<length; i++) {
                element = childNodes[i];
                if (element.data && ('' + element.data).indexOf('°C') >= 0) {
                    temp = parseInt(element.data, 10);
                    break;
                }
            }
    
            // Update image and temp in UI
            var forecast = $('.weather .' + city);
            forecast.find('.conditions img').attr('src', imgUrl);
            forecast.find('.temp .value').text(temp);
        });
    }
    
    function refreshWeatherForecasts() {
        for (var city in CITY_CODES) {
            if (CITY_CODES.hasOwnProperty(city)) {
                refreshWeatherForecastForCity(city);
            }
        }
    }

    refreshWeatherForecasts();
    setInterval(refreshWeatherForecasts, WEATHER_REFRESH_TIMEOUT_MILLIS);
});