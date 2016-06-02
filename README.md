# taxibutton
Futurice Taxi Button

This is Futurice Taxi Button, system running on Raspberry Pi that can order a taxi with one button press. It also shows current weather conditions and public transport timetables for nearby stops.

##Api keys, usernames and passwords

All your api keys, usernames and passwords should be in `Nodejs/secrets.js`file. You need credentials for the following apis and services:

* OpenWeatherMap http://openweathermap.org/ for weather
* Reittiopas API http://developer.reittiopas.fi/pages/en/http-get-interface-version-2.php for public transport timetables
* Kannel http://www.kannel.org/ for sending and receiving text messages.
