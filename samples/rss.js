
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Request = require('yow/request');
var sprintf = require('yow/sprintf');
var Parser = require('rss-parser');
var Events = require('events');

/*

*/

var debug = function() {
}

class Feed extends Events {
    constructor(options) {
        super(options);

        var {url} = options;

        this.url = url;
        this.parser = new Parser();


    }

    delay(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    fetch() {
        return new Promise((resolve, reject) => {
            debug('Fetching', this.url);

            this.parser.parseURL(this.url).then((feed) => {

                // Sort by date DESC
                feed.items.sort((a, b) => {
                    a = new Date(a.isoDate);
                    b = new Date(b.isoDate);
                    return b.getTime() - a.getTime();
                });

                feed.items.forEach((item) => {
                    var date = new Date(item.isoDate);
                    debug(date, date.toString(), item.title);
                });

                resolve(feed);
            })
            .catch((error) => {
                console.error(error);
                reject(error);

            })
        });

    }

    run() {
        fetch().then(() => {
            setTimeout(this.run, 5000);
        })
        .catch((error) => {
            console.error(error);
        });

    }
    

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
        args.option('url', {describe:'Feed URL', default:'https://www.sydsvenskan.se/rss.xml?latest'});
        args.option('debug', {describe:'Debug mode', default:true});

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
        var feed = new Feed({url:argv.url});



        function delay(ms) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, ms);
            });

        }

        function fetchRSS() {
            return new Promise((resolve, reject) => {
                debug('Fetching!')
                parser.parseURL(argv.url).then((feed) => {

                    // Sort by date DESC
                    feed.items.sort((a, b) => {
                        a = new Date(a.isoDate);
                        b = new Date(b.isoDate);
                        return b.getTime() - a.getTime();
                    });

                    feed.items.forEach((item) => {
                        var date = new Date(item.isoDate);
                        debug(date, date.toString(), item.title);
                    });

                    resolve(feed);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);

                })
            });
        }

        feed.run();
//        feed.fetch();

	}
    


};

new Command();



