
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Timer = require('yow/timer');
var sprintf = require('yow/sprintf');
var RainAnimation = require('../src/rain-animation.js');

var debug = console.log;


class OpenWeatherMap {

    constructor() {

    }

    parseWeather(weather) {

    }
    
    fetch() {
        return new Promise((resolve, reject) => {
            var Request = require('yow/request');
            var request = new Request('http://api.openweathermap.org');
    
            var query = {};
            query.appid   = process.env.OPENWEATHERMAP_APPID;
            query.lat     = 55.71;
            query.lon     = 13.19;
            query.exclude = 'minutely,hourly';
            query.units   = 'metric';
            query.lang    = 'se';
    
            request.get('/data/2.5/onecall', {query:query}).then((response) => {
                response.body.current.dt = new Date(response.body.current.dt * 1000);
                response.body.current.sunset = new Date(response.body.current.sunset * 1000);
                response.body.current.sunrise = new Date(response.body.current.sunrise * 1000);

                var current  = response.body.current;
                var tomorrow = response.body.daily[1];

                var texts = [];
                texts.push(sprintf('Idag %0f° och %s', current.temp, current.weather.description));
                texts.push(sprintf('I morgon %0f° (%0f°) och %s', tomorrow.weather.max, tomorrow.weather.min, tomorrow.weather.description));

                response.body.daily.forEach(element => {
                    element.dt = new Date(element.dt * 1000);
                    element.sunset = new Date(element.sunset * 1000);
                    element.sunrise = new Date(element.sunrise * 1000);
                });

                console.log(response.body);
                resolve(texts);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
};

class Command {

    constructor() {
        module.exports.command  = 'weather [options]';
        module.exports.describe = 'Display weather';
        module.exports.builder  = this.defineArgs.bind(this);
        module.exports.handler  = this.run.bind(this);

        this.debug = console.log;

    }

 
    defineArgs(args) {

        args.usage('Usage: $0 [options]');

        args.option('help', {describe:'Displays this information'});
        args.option('debug', {describe:'Debug mode', default:false});

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }
    
    

    run(argv) {

        try {
            var api = new OpenWeatherMap();

            api.fetch().then((weather) => {
                this.debug(JSON.stringify(weather, null, '    '));
            })
            .then(() => {
                this.debug('Done!');
            })
            .catch(error => {
                console.error(error);
            })
        }
        catch (error) {
            console.error(error);
        }

    }
    


};

new Command();



