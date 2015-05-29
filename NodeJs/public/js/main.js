(function($) {
    var REITTIOPAS_REFRESH_TIMEOUT_MILLIS = 1000*60*1;
    var WEATHER_REFRESH_TIMEOUT_MILLIS = 1000*60*5;
    
    var REITTIOPAS_BASE_URL = 'http://api.reittiopas.fi/public-ytv/fi/api/?user=futurice&pass=9e0h2s3h&stop=';
    var SHORT_WALK_STOP_URL = REITTIOPAS_BASE_URL + '1045';
    var LONG_WALK_STOP_URL = REITTIOPAS_BASE_URL + '1055';
    
    var WEATHERBUG_API_CODE = 'A4673533785';
    var WEATHERBUG_BASE_URL = 'http://' + WEATHERBUG_API_CODE + '.api.wxbug.net/getLiveWeatherRSS.aspx';

    // Will ignore buses of the same line with this amount or less minutes in between.
    var TIME_LIMIT = 10;
    // Set this to ignore time limit above.
    var IGNORE_TIME_LIMIT = true;
    var ARRIVAL_ITEMS = 4;

    // Set this to true, if this display has a TaxiButton(tm)
    // if button not working, set temporarily to false
    var TAXI_BUTTON = true;
    var LAST_UPDATE = Math.round(new Date().getTime()/1000); //Last TaxiUpdate, in seconds since epoch
    
    /*
     * Bus schedules
     */
    
    function diffMinutesToStr(diffMinutes) {
        var hours = Math.floor(diffMinutes / 60);
        var minStr = ' min'; //(diffMinutes%60 === 1) ? " min" : " mins";
        if (false /*hours > 0*/) {
            return hours + 'h' + diffMinutes%60 + minStr;
        } else {
            return diffMinutes + minStr;
        }
    }
    
    function populateTable(tableId, arrivalData) {
        var total = 0;
        for (var i=0; i<arrivalData.length && total<ARRIVAL_ITEMS; i++) {
            var item = arrivalData[i];
            var stopTime = formatHourMinTime(item.time);
            var diffTime = Math.round((item.time - new Date()) / (1000*60));
            if (diffTime > 0) {
                $(tableId).append(
                    '<tr><td class="line">' + item.busLineName + '</td>' +
                    '<td class="destination">' + /*item.destination +*/ (item.busLineName == 501 ? 'Espoo' : 'Helsinki') + '</td>' +
                    '<td class="diffTime">' + diffMinutesToStr(diffTime) + '</td>' +
                    '<td class="stopTime">' + stopTime + '</td></tr>');
                total++;
            }
            if (i >= arrivalData.length) {
                break;
            }
        }
    }
    
    function isTrueData(evaluateItem, savedItems) {
        if (!savedItems || !savedItems.length) {
            return true;
        }
            
        for (var i=0; i<savedItems.length; ++i) {
            var item = savedItems[i];
            var timeDiff = (evaluateItem.time.getHours()*60 + evaluateItem.time.getMinutes()) - (item.time.getHours()*60 + item.time.getMinutes());
            if (evaluateItem.busLineName === item.busLineName && (timeDiff <= TIME_LIMIT && !IGNORE_TIME_LIMIT)) {
                return false;
            }
        }
        
        return true;
    }
    
    function getReittiopasStopData(apiData) {
        var lines = apiData.split('\n'),
        	returnData = [];
        
        for (var i=1; i<lines.length; ++i) {
            var line = lines[i];
            if (line && line.length && line.length > 1) {
                var data = line.split('|');
                var time = lpad(data[0], '0', 4);
                var hour = parseInt(time.substring(0, 2), 10);
                var minute = parseInt(time.substring(2, 4), 10);
                var isTomorrow = 0;
                if (hour > 23) {
                    isTomorrow = 1;
                    hour = hour - 24;
                }
                
                var now = new Date();
                var atStop = new Date(now.getFullYear(), now.getMonth(), now.getDate()+isTomorrow, hour, minute, 0);
                var diffMinutes = (atStop.getTime() - now.getTime()) / (1000*60);
                
                data = {
                    minutes: diffMinutes,
                    time: atStop,
                    busLineName: data[1],
                    destination: data[2]
                };
    
                if (isTrueData(data, returnData)) {
                    returnData[returnData.length] = data;
                }
            }
    	}
        
        return returnData;
    }
    
    function refreshReittiopasData() {
        $.get(SHORT_WALK_STOP_URL, function(data) {
            $('#shortwalk_table').empty();
            populateTable('#shortwalk_table', getReittiopasStopData(data));
        });
        $.get(LONG_WALK_STOP_URL, function(data) {
            $('#longwalk_table').empty();
            populateTable('#longwalk_table', getReittiopasStopData(data));
        });
        setTimeout(refreshReittiopasData, REITTIOPAS_REFRESH_TIMEOUT_MILLIS);
    }
    
    /*
     * Weather
     */
    
    // Search city codes by 'http://a4673533785.api.wxbug.net/getLocationsXML.aspx?ACode=A4673533785&SearchString=<city name>'
    var CITY_CODES = {
        Helsinki: 62073,
        Tampere: 62152,
        Berlin: 58439,
        London: 60876
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
            var forecast = $('#weather' + city);
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
        setTimeout(refreshWeatherForecasts, WEATHER_REFRESH_TIMEOUT_MILLIS);
    }
    
    function progressDots(i) {
	if($('.processing').is(':visible')){
	    $('.dot'+i).fadeOut(450,function(){
		progressDots((i+1)%3);
	    });
	    $('.dot'+(i+1)%3).fadeIn();
	    $('.dot'+(i+2)%3).fadeIn();
	}
    }

    function resetTaxi() {
	var taxi = "";

	if(TAXI_BUTTON) {
	    taxi = '<h2 id="prefer"><div class="glare"></div>Prefer a taxi?</h2><p class="no_orders">Order one with the Taxi-button :)<br/><img src="arrow-down.png"></img></p><p class="orders"></p>';
	}else{
	    taxi = '<h2><div class="glare"></div>Prefer a taxi?</h2><p>Send the following SMS<br />"<strong>helsinki vattuniemenranta 2</strong>"<br /> to <strong>13170</strong> <em>or</em><br/>call <strong>0100 0700</strong></p>';
	}

	$('#taxi').html(taxi);
    }

    /*
     * Other
     */
    $(document).ready(function() {
        refreshReittiopasData();
        refreshWeatherForecasts();

	// Show TaxiButton(tm) UI or normal
	resetTaxi();

	if(TAXI_BUTTON){
	    setInterval(updateTaxiInformation,500);
	}

    });

    function updateTaxiInformation(){
	$.get('http://localhost/taxi_messages.php',function(data){
	    var lines = data.split("\n");
	    lines.pop(); //remove the extra line
	    for(var i in lines){
		var line = lines[i];
		var parts = line.split(":");
		var timestamp = parts[0];
		var key = parts[1].split(" ")[0];
		var value = parts[1].split(" ")[1];
		if(timestamp > LAST_UPDATE){
		    LAST_UPDATE = timestamp;
		    if(key == "CLICK"){
			if(!$('.orders').is(':visible')){
			    $('.no_orders').hide();
			    $('#taxi').animate({'background-color':'#FFCC00 !important'},350);
			}
			$('.orders').append('<p class="taxi_wrap processing">Processing<span class="dot0">.</span><span class="dot1">.</span><span class="dot2">.</span></p>');
			$('.orders').fadeIn();
			progressDots(0);
			setTimeout(removeFirstProcessing, 480000);
		    }else if(key == "TILAUS"){
			removeFirstProcessing("no_reset");
			$('.orders').append('<p class="taxi_wrap response">Got response, waiting for taxi confirmation (max 8min).</p>');
			setTimeout(removeFirstResponse, 480000);
		    }else if(key == "TAKSI"){
			removeFirstResponse("no_reset");
			$('.orders').append('<p class="taxi_wrap success">Taxi #'+value+' is coming to pick you up! \\o/</p>');
			setTimeout(removeFirstSuccess, 60000);
		    }else if(key == "VARATTU"){
			removeFirstResponse("no_reset");
			$('.orders').append('<p class="taxi_wrap fail">There are no taxis available at the moment, please try again.</p>');
			setTimeout(removeFirstFail, 10000);
		    }else if(key == "CLICK_TOO_SHORT"){
			$('.orders').append('<p class="taxi_wrap fail">Button pressed to shortly (' + value + 'ms), please hold it longer.</p>');
			setTimeout(removeFirstFail, 10000);
		    }else if(key == "ERROR"){
			if($('.taxi_wrap.response').size() > 0) {
			    removeFirstResponse("no_reset");
			}else{
			    removeFirstProcessing("no_reset");
			}
			$('.orders').append('<p class="taxi_wrap fail">An error happened, try again.</p>');
			setTimeout(removeFirstFail, 10000);
		    }
		}
	    }
	});
    }

    function removeFirstFail(reset){
	$('.taxi_wrap.fail').first().remove();
	if(reset != "no_reset"){
	    resetTaxiState();
	}
    }

    function removeFirstSuccess(reset){
	$('.taxi_wrap.success').first().remove();
	if(reset != "no_reset"){
	    resetTaxiState();
	}
    }

    function removeFirstResponse(reset){
	$('.taxi_wrap.response').first().remove();
	if(reset != "no_reset"){
	    resetTaxiState();
	}
    }

    function removeFirstProcessing(reset){
	$('.taxi_wrap.processing').first().remove();
	if(reset != "no_reset"){
	    resetTaxiState();
	}
    }

    function resetTaxiState(){
	if($('.taxi_wrap').length==0) {
	    $('.orders').hide();
	    $('.no_orders').fadeIn(250);
	    $('#taxi').animate({'background-color':'#4C9018 !important'},500);
	}
    }

}(jQuery));