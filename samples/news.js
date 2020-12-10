
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;
var Timer = require('yow/timer');
var sprintf = require('yow/sprintf');

var debug = console.log;


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
    
    run(argv) {
        Matrix.configure(argv);

        var queue = new AnimationQueue();
        var service = new NewsService({queue:queue, argv:argv});

        service.run().then(() => {
            console.log('Done!');
        });

        queue.dequeue();
    }


};

new Command();



