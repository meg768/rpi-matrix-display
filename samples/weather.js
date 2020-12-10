
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;
var WeatherService = require('../src/weather-service.js');


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
        Matrix.configure(argv);

        var queue = new AnimationQueue();
        var service = new WeatherService({queue:queue, argv:argv});

        service.run().then(() => {
            console.log('Done!');
        });

        queue.dequeue();
    }


    


};

new Command();



