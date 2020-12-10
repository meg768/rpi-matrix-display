
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;
var NewsService = require('../src/news-service.js');
var Timer = require('yow/timer');

class Command {

    constructor() {
        module.exports.command  = 'news [options]';
        module.exports.describe = 'Display news';
        module.exports.builder  = this.defineArgs.bind(this);
        module.exports.handler  = this.run.bind(this);
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

    displayNews() {

        return new Promise((resolve, reject) => {

        });
    };


    run(argv) {
        Matrix.configure(argv);

        var timer = new Timer();
        var queue = new AnimationQueue();

        var displayService = () => {
            var service = new NewsService({queue:queue, argv:argv});

            service.run().then(() => {
                timer.setTimer(1000 * 60 * 2, () => {
                    displayService();
                })
            });
    
        };

        displayService();

        queue.dequeue();
    }


};

new Command();



