
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;
var WeatherService = require('../src/weather-service.js');
var Command = require('../src/command.js');



module.exports = class WeatherCommand extends Command {

    constructor() {
        super({command: 'weather [options]', description: 'Display weather'}); 
    }

    options(args) {
        super.options(args);
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






