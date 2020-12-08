
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Timer = require('yow/timer');
var sprintf = require('yow/sprintf');
var RainAnimation = require('../src/rain-animation.js');

var debug = console.log;


class OpenWeather {

    constructor() {

    }

    fetch() {
        return new Promise((resolve, reject) => {
            var Request = require('yow/request');
            var request = new Request('http://api.openweathermap.org');
    
            var query = {};
            query.lat     = process.env.OPENWEATHERMAP_LAT;
            query.lon     = process.env.OPENWEATHERMAP_LON;
            query.appid   = process.env.OPENWEATHERMAP_APPID;
            query.exclude = 'minutely,hourly';
    
            request.get('/data/2.5/onecall', {query:query}).then((response) => {
                resolve(response);
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
            var api = new OpenWeather();

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



