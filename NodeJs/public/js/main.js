$(function() {
 //    // Set this to true, if this display has a TaxiButton(tm)
 //    // if button not working, set temporarily to false
 //    var TAXI_BUTTON = true;
 //    var LAST_UPDATE = Math.round(new Date().getTime()/1000); //Last TaxiUpdate, in seconds since epoch
    
 //    function progressDots(i) {
 //        if($('.processing').is(':visible')){
 //            $('.dot'+i).fadeOut(450, function(){
 //                progressDots((i+1)%3);
 //            });
 //            $('.dot'+(i+1)%3).fadeIn();
 //            $('.dot'+(i+2)%3).fadeIn();
 //        }
 //    }

 //    function resetTaxi() {
	// var taxi = "";

	// if(TAXI_BUTTON) {
	//     taxi = '<h2 id="prefer"><div class="glare"></div>Prefer a taxi?</h2><p class="no_orders">Order one with the Taxi-button :)<br/><img src="arrow-down.png"></img></p><p class="orders"></p>';
	// }else{
	//     taxi = '<h2><div class="glare"></div>Prefer a taxi?</h2><p>Send the following SMS<br />"<strong>helsinki vattuniemenranta 2</strong>"<br /> to <strong>13170</strong> <em>or</em><br/>call <strong>0100 0700</strong></p>';
	// }

	// $('#taxi').html(taxi);
 //    }

 //    /*
 //     * Other
 //     */
 //    $(document).ready(function() {
 //        refreshReittiopasData();

	// // Show TaxiButton(tm) UI or normal
	// resetTaxi();

	// if(TAXI_BUTTON){
	//     setInterval(updateTaxiInformation,500);
	// }

 //    });

 //    function updateTaxiInformation(){
	// $.get('http://localhost/taxi_messages.php',function(data){
	//     var lines = data.split("\n");
	//     lines.pop(); //remove the extra line
	//     for(var i in lines){
	// 	var line = lines[i];
	// 	var parts = line.split(":");
	// 	var timestamp = parts[0];
	// 	var key = parts[1].split(" ")[0];
	// 	var value = parts[1].split(" ")[1];
	// 	if(timestamp > LAST_UPDATE){
	// 	    LAST_UPDATE = timestamp;
	// 	    if(key == "CLICK"){
	// 		if(!$('.orders').is(':visible')){
	// 		    $('.no_orders').hide();
	// 		    $('#taxi').animate({'background-color':'#FFCC00 !important'},350);
	// 		}
	// 		$('.orders').append('<p class="taxi_wrap processing">Processing<span class="dot0">.</span><span class="dot1">.</span><span class="dot2">.</span></p>');
	// 		$('.orders').fadeIn();
	// 		progressDots(0);
	// 		setTimeout(removeFirstProcessing, 480000);
	// 	    }else if(key == "TILAUS"){
	// 		removeFirstProcessing("no_reset");
	// 		$('.orders').append('<p class="taxi_wrap response">Got response, waiting for taxi confirmation (max 8min).</p>');
	// 		setTimeout(removeFirstResponse, 480000);
	// 	    }else if(key == "TAKSI"){
	// 		removeFirstResponse("no_reset");
	// 		$('.orders').append('<p class="taxi_wrap success">Taxi #'+value+' is coming to pick you up! \\o/</p>');
	// 		setTimeout(removeFirstSuccess, 60000);
	// 	    }else if(key == "VARATTU"){
	// 		removeFirstResponse("no_reset");
	// 		$('.orders').append('<p class="taxi_wrap fail">There are no taxis available at the moment, please try again.</p>');
	// 		setTimeout(removeFirstFail, 10000);
	// 	    }else if(key == "CLICK_TOO_SHORT"){
	// 		$('.orders').append('<p class="taxi_wrap fail">Button pressed to shortly (' + value + 'ms), please hold it longer.</p>');
	// 		setTimeout(removeFirstFail, 10000);
	// 	    }else if(key == "ERROR"){
	// 		if($('.taxi_wrap.response').size() > 0) {
	// 		    removeFirstResponse("no_reset");
	// 		}else{
	// 		    removeFirstProcessing("no_reset");
	// 		}
	// 		$('.orders').append('<p class="taxi_wrap fail">An error happened, try again.</p>');
	// 		setTimeout(removeFirstFail, 10000);
	// 	    }
	// 	}
	//     }
	// });
 //    }

 //    function removeFirstFail(reset){
	// $('.taxi_wrap.fail').first().remove();
	// if(reset != "no_reset"){
	//     resetTaxiState();
	// }
 //    }

 //    function removeFirstSuccess(reset){
	// $('.taxi_wrap.success').first().remove();
	// if(reset != "no_reset"){
	//     resetTaxiState();
	// }
 //    }

 //    function removeFirstResponse(reset){
	// $('.taxi_wrap.response').first().remove();
	// if(reset != "no_reset"){
	//     resetTaxiState();
	// }
 //    }

 //    function removeFirstProcessing(reset){
	// $('.taxi_wrap.processing').first().remove();
	// if(reset != "no_reset"){
	//     resetTaxiState();
	// }
 //    }

 //    function resetTaxiState(){
	// if($('.taxi_wrap').length==0) {
	//     $('.orders').hide();
	//     $('.no_orders').fadeIn(250);
	//     $('#taxi').animate({'background-color':'#4C9018 !important'},500);
	// }
 //    }

});
