
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Request = require('yow/request');
var sprintf = require('yow/sprintf');
var Parser = require('rss-parser');

var debug = function() {
}

class Command {

    constructor() {
        module.exports.command  = 'rss [options]';
        module.exports.describe = 'Display RSS feeds';
        module.exports.builder  = this.defineArgs;
        module.exports.handler  = this.run;
        
    }

 
    defineArgs(args) {

        args.usage('Usage: $0 [options]');

        args.option('help', {describe:'Displays this information'});
        args.option('textColor', {describe:'Specifies text color', alias:['color'], default:'auto'});
        args.option('pause', {describe:'Pause between news flashes in minutes', default:5});
        args.option('debug', {describe:'Debug mode', default:false});

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }


	run(argv) {
        if (argv.debug)
            debug = console.log;

        debug(argv);

        Matrix.configure(argv);
        var queue = new AnimationQueue();
        var parser = new Parser();



        function delay(ms) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, ms);
            });

        }

        function fetchRSS() {
            return new Promise((resolve, reject) => {
                console.log('Fetching!')
                parser.parseURL('https://www.sydsvenskan.se/rss.xml?latest').then((feed) => {
                    console.log(feed);
                    resolve(feed);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);

                })
            });
        }

        fetchRSS();

	}
    


};

new Command();



