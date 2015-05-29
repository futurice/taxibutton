$(function(){
    var CLOCK_UPDATE_TIMEOUT_MILLIS = 1000;
    
    function repeat(str, count) {
        var outStr = '';
        for (var i=0; i<count; ++i) {
            outStr += str;
        }
        return outStr;
    }
    
    function lpad(obj, padding, minCount) {
        var str = '' + obj;
        return (str.length < minCount) ? (repeat(padding, minCount-str.length) + str) : str;
    }
    
    function toTimeElem(number) {
        return lpad(number, '0', 2);
    }
    
    function formatTime(hours, minutes, seconds) {
        var str = toTimeElem(hours);
        if (minutes != null) {
            str += ':' + toTimeElem(minutes);
        }
        if (seconds != null) {
            str += ':' + toTimeElem(seconds);
        }
        return str;
    }

    function formatHourMinTime(date) {
        return formatTime(date.getHours(), date.getMinutes());
    }
    
    function updateTime() {
        var now = new Date();
        var $datetime = $('#header .datetime');
        $datetime.find('.date').text(('' + now).substring(0, 10));
        $datetime.find('.time').text(formatHourMinTime(now));
    }

    updateTime();
    setInterval(updateTime, CLOCK_UPDATE_TIMEOUT_MILLIS);
});