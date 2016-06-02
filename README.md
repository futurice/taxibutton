#taxibutton
Futurice Taxi Button

<img src ="https://raw.githubusercontent.com/futurice/taxibutton/master/example_pictures/taxibutton.jpg" width=300>

This is Futurice Taxi Button, system running on Raspberry Pi that can order a taxi with one button press. It also shows current weather conditions and public transport timetables for nearby stops. The system is a nodejs application that displays all the information on index.html page on localhost. 

##Api keys, usernames and passwords

All your api keys, usernames and passwords should be in `Nodejs/secrets.js` file. Kannel credentials should also be written to `RaspberryPi/Kannel/kannel.conf` You need credentials for the following apis and services:

* OpenWeatherMap http://openweathermap.org/ for weather
* Reittiopas API http://developer.reittiopas.fi/pages/en/http-get-interface-version-2.php for public transport timetables
* Kannel http://www.kannel.org/ for sending and receiving text messages.

##Setting up the system

We are using Raspberry pi 3 with Raspbian Jessie. The easiest way is to use it with NOOBS setup. https://www.raspberrypi.org/downloads/. A USB GSM dongle is required to send and receive SMS messages. 

###Install NodeJS and dependencies
Raspbian might have some version of NodeJS pre-installed. If [Node-arm](http://node-arm.herokuapp.com/) install fails, you  might have to remove the old version first. 

`wget http://node-arm.herokuapp.com/node_latest_armhf.deb`

`sudo dpkg -i node_latest_armhf.deb`

`npm install`

###Install a browser and run it on startup
There is no more Chromium version for Raspbian Jessie, that's why we are using Iceweasel. There is no command line option for kiosk mode in Iceweasel, but with [mKiosk](https://addons.mozilla.org/en-US/firefox/addon/mkiosk) add-on we can achieve the same thing. 
Install Iceweasel and x11-xserver-utils. Open Iceweasel, settings -> add-ons and install mKiosk. 

`sudo apt-get install iceweasel x11-xserver-utils``

Restart Iceweasel after installing mKiosk, and mKiosk configuration panel appears. Set the starting page to be localhost:8080 and disable all navigation bars and user controls. Set mKiosk default screensaver off.

Let's give a 5 sec delay prior to running the browser in order to let other things start first.
Create a script

`touch /home/pi/sleep-start-iceweasel.sh`

`nano /home/pi/sleep-start-iceweasel.sh`

`chmod 755 /home/pi/sleep-start-iceweasel.sh`

Set script content to be `sleep 5 && iceweasel`

Set the script to be run on GUI startup

`sudo nano .config/lxsession/LXDE-pi/autostart``

Add to end:

`@/home/pi/sleep-start-iceweasel.sh`








