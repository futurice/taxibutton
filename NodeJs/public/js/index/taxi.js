(function(futu, $, undefined) {
    futu.taxi = (function () {
        var instance;
        var config;

        function init() {
            return {
                transition: function (data) {
                    var $taxi = $('.taxi');
                    $taxi.empty();
                    $('.taxi').append($('<span>').text(JSON.stringify(data)));
                    console.log(data);
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