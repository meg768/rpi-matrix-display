
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;
var NewsService = require('../src/news-service.js');
var Timer = require('yow/timer');
var Command = require('../src/command.js');

module.exports = class NewsCommand extends Command {

    constructor() {
        super({command:'news [options]', description:'Display news'});
    }

 
    options(args) {

        args.usage('Usage: $0 [options]');

        args.option('help', {describe:'Displays this information'});
        args.option('debug', {describe:'Debug mode', default:false});

    }





    run(argv) {
        Matrix.configure(argv);

        var timer = new Timer();
        var queue = new AnimationQueue();

        var displayService = () => {
            var service = new NewsService({queue:queue, argv:argv});
            return service.run();
        };

        queue.on('idle', () => {
            timer.setTimer(1000 * 60 * 5, () => {
                displayService();
            });
        });

        displayService();

        queue.dequeue();
    }


};



