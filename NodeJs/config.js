module.exports = {
    "logging": {
        "level": "INFO" // DEBUG | INFO | NOTICE | WARNING | ERROR | CRITICAL
    },
    "httpServer" : {
        "port": 8080
    },
    "webSocketServer": {
        "port": 8081
    },
    "smsGate": {
        "isFaked": true, // Enable to prevent SMS being really sent
        "host": "localhost",
        "port": 13013,
        "path": "/cgi-bin/sendsms",
    },
    "taxiService": {
        "phoneNumber": "YOUR_LOCAL_TAXI_NUMBER",
        "orderMessage": "YOUR ADDRESS"
    },
    "button":  {
        "pin": 18, // GPIO pin number, not connector pin number
        "debounceTimeout": 120, // ms
    },
    "taxiMachine": {
        "pressedTimeout": 3 * 1000, // ms
        "quickieTimeout": 5 * 1000, // ms
        "orderingTaxiTimeout": 8 * 60 * 1000, // ms. Should be 8 min according to Taxi Helsinki
        "awaitingTaxiTimeout": 8 * 60 * 1000, // ms. Should be 8 min according to Taxi Helsinki
        "taxiConfirmedTimeout": 30 * 1000, // ms
        "allBusyTimeout": 20 * 1000,// ms
        "orderFailedTimeout": 20 * 1000 // ms
    },
    "calendar": {
        "weather": { // http://openweathermap.org/
            "apiUrl": "http://api.openweathermap.org/data/2.5/weather",
            "refreshInterval": 5 * 60 * 1000 // ms
        },
        "places": [
            {
                "name": "Helsinki",
                "query": "Helsinki,FI",
                "timezone": "Europe/Helsinki",
            },
            {
                "name": "Tampere",
                "query": "Tampere,FI",
                "timezone": "Europe/Helsinki",
            },
            {
                "name": "Berlin",
                "query": "Berlin,DE",
                "timezone": "Europe/Berlin",
            },
            {
                "name": "London",
                "query": "London,UK",
                "timezone": "Europe/London",
            },
            {
                "name": "Stockholm",
                "query": "Stockholm, SE",
                "timezone": "Europe/Stockholm",
            },
            {
                "name": "München",
                "query": "Muenchen,DE",
                "timezone": "Europe/Berlin",
            },
            {
                "name": "Oslo",
                "query": "Oslo,NO",
                "timezone": "Europe/Oslo",
            },
            // {
            //     "name": "Helsinki",
            //     "query": "Helsinki,FI", // Query to request weather data from http://openweathermap.org/
            //     "timezone": "Europe/Helsinki", // Timezone name according to http://momentjs.com/timezone/
            // },
        ]
    },
    "schedule": {
        "refreshInterval": 60 * 60 * 1000, // ms
        "removePastDepaturesInterval": 6 * 1000, // ms
        "switchStopsInterval": 8 * 1000, // ms
        "apiUrl": "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql",
        "stopCodes": [
            "HSL:1040144", // Kamppi(M), Laituri 76 (1237)
            "HSL:1040148", // Kamppi(M), Laituri 75 (1222)
            "HSL:1040411", // Simonkatu (0231)
            "HSL:1040410", // Simonkatu (0232)
        ],
    }
};
