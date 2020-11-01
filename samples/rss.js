
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Request = require('yow/request');
var sprintf = require('yow/sprintf');
var Parser = require('rss-parser');
var Events = require('events');
const { time } = require('console');
const { emit } = require('process');

/*

*/

var debug = function() {
}

class Feed extends Events {
    constructor(options) {
        super(options);

        var {url, name = 'Noname'} = options;

        this.url = url;
        this.name = name;
        this.parser = new Parser();
        this.timestamp = undefined;
        this.run();

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

                // Pick first/latest one
                var item  = feed.items[0];
                var timestamp = new Date(item.isoDate);
                var title = item.title;

                if (this.timestamp == undefined || timestamp > this.timestamp) {
                    this.timestamp = timestamp;
                    this.emit('ping', {timestamp:timestamp, name:this.name, title:title});
                }

                resolve(item);
            })
            .catch((error) => {
                console.error(error);
                reject(error);

            })
        });

    }

    run() {
        this.fetch().then(() => {
            setTimeout(() => {
                this.run();
            }, 5000);
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

        function subscribe(options) {
            var {url, name} = options;
            var feed = new Feed(options);
            feed.on('ping', (item) => {
                console.log('PING!!!', item);
            });
        }
        Matrix.configure(argv);
        var queue = new AnimationQueue();


        subscribe({url:'https://digital.di.se/rss', name:'DI'});
        subscribe({url:'https://www.sydsvenskan.se/rss.xml?latest', name:'SDS'});
        subscribe({url:'http://www.svd.se/?service=rss', name:'SVD'});
        subscribe({url:'https://rss.aftonbladet.se/rss2/small/pages/sections/aftonbladet', name:'Aftonbladet'});
        subscribe({url:'https://feeds.expressen.se/nyheter', name:'Expressen'});
     
	}
    


};

new Command();



