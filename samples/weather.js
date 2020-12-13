
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;
var WeatherService = require('../src/weather-service.js');
var Command = require('../src/command.js');



module.exports = class WeatherCommand extends Command {

    constructor() {
        super({command: 'weather', description: 'Display weather'}); 
    }

 
    options(args) {
        console.log('DEFINING OPTIONS weather');

		args.option('textColor', {describe:'Text color', default:'red'});

    }
    
    
    run(argv) {
        Matrix.configure(argv);

        var queue = new AnimationQueue();

        var runService = () => {
            var service = new WeatherService({argv:argv, queue:queue});
            service.run();
        };

        queue.on('idle', () => {
            runService();
        });

        runService();
        
        queue.dequeue();
    }


    


};
class CommandX {

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
        args.option('debug', {describe:'Debug mode', default:undefined});

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }
    
    
    run(argv) {
        Matrix.configure(argv);

        var queue = new AnimationQueue();

        var runService = () => {
            var service = new WeatherService({argv:argv, queue:queue});
            service.run();
        };

        queue.on('idle', () => {
            runService();
        });

        runService();
        
        queue.dequeue();
    }


    


};





