<?php

$folder = "/var/run/taxi/";

$lock = $folder."lock";
$messages = $folder."messages";

$messageLines = explode(" ",exec("wc -l ".$messages));

if($messageLines[0] + 1 > 10){ #rotate message file

  rename($messages,$folder."old_messages/messagesTo".time());

}

error_log("Incoming message: ".$_GET["message"]);

$words = explode(" ",$_GET["message"]);

$key = "ERROR";
$value = "-1";

if($words[0] == "Tilaus"){
  $key = "TILAUS";
  $value = $words[count($words)-1];
}else if($words[0] == "Taksi"){
  $key = "TAKSI";
  $value = $words[2];
}else if($words[0] == "Kaikki"){
  $key = "VARATTU";
}

$file = fopen($messages,"a");
fwrite($file,time() .":". $key ." ". $value ."\n");
fclose($file);

unlink($lock);

?>
