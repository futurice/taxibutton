import json
import urllib
import pprint

short_stop = 1045
long_stop = 1055
base_url = "http://api.reittiopas.fi/hsl/prod/?request=stop&user=futurice&pass=9e0h2s3h&format=json&code="

def get_departures(url, busname=None):
   response = urllib.urlopen(url);
   data = json.loads(response.read())
   #pp = pprint.PrettyPrinter(depth=6)
   #pp.pprint(data)

   for deptime in data[0]['departures'][0:3]:
       print deptime['time'] + "<br />"

print "Short stop"
get_departures(base_url + str(short_stop));
