$(function(){
    var REITTIOPAS_REFRESH_TIMEOUT_MILLIS = 1000*30*1;
    
    var REITTIOPAS_BASE_URL = 'http://api.reittiopas.fi/public-ytv/fi/api/?user=futurice&pass=9e0h2s3h&stop=';
    var SHORT_WALK_STOP_URL = REITTIOPAS_BASE_URL + '1045';
    var LONG_WALK_STOP_URL = REITTIOPAS_BASE_URL + '1055';

    // Will ignore buses of the same line with this amount or less minutes in between.
    var TIME_LIMIT = 10;
    // Set this to ignore time limit above.
    var IGNORE_TIME_LIMIT = true;
    var ARRIVAL_ITEMS = 4;

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
    
    function populateTable($table, arrivalData) {
    	$table.empty();
    	
        var total = 0;
        for (var i=0; i<arrivalData.length && total<ARRIVAL_ITEMS; i++) {
            var item = arrivalData[i];
            var stopTime = formatHourMinTime(item.time);
            var diffTime = Math.round((item.time - new Date()) / (1000*60));
            if (diffTime > 0) {
                $table.append(
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
            var $table = $('table.shortwalk');
            populateTable($table, getReittiopasStopData(data));
        });
        $.get(LONG_WALK_STOP_URL, function(data) {
            var $table = $('table.longwalk');
            populateTable($table, getReittiopasStopData(data));
        });
    }

    refreshReittiopasData();
    setInterval(refreshReittiopasData, REITTIOPAS_REFRESH_TIMEOUT_MILLIS);
});