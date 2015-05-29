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
        return str.length < minCount ? (repeat(padding, minCount-str.length) + str) : str;
    }
    
    function toTimeElem(number) {
        return lpad(number, '0', 2);
    }
    
    function formatTime(hours, minutes, seconds) {
        return toTimeElem(hours)
            + (minutes != null ? ':' + toTimeElem(minutes) : '')
            + (seconds != null ? ':' + toTimeElem(seconds) : '');
    }

    function updateTime() {
        var now = new Date();
        var $datetime = $('#header .datetime');
        $datetime.find('.date').text(('' + now).substring(0, 10));
        $datetime.find('.time').text(formatTime(now.getHours(), now.getMinutes()));
    }

    updateTime();
    setInterval(updateTime, CLOCK_UPDATE_TIMEOUT_MILLIS);
});