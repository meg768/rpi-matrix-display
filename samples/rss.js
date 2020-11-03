
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
        this.latest = undefined;
        this.cache = {};
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

            this.parser.parseURL(this.url).then((feed) => {

                if (feed.items.length > 0) {
                    var now = new Date();
                    var someTimeAgo = new Date();

                    someTimeAgo.setHours(someTimeAgo.setHours() - 1); 

                    // Create a timestamp for each item
                    feed.items.forEach((item) => {
                        item.timestamp = new Date(item.isoDate);
                    });

                    // Sort by date ASC
                    feed.items.sort((a, b) => {
                        return a.timestamp.getTime() - b.timestamp.getTime();
                    });


                    // Filter out latest RSS
                    feed.items = feed.items.filter((item) => {
                        if (item.timestamp.getTime() > someTimeAgo.getTime())
                            return item;
                    });



                    debug(this.name, '---------------------------------------')
                    debug('ITEMS');
                    debug(JSON.stringify(feed.items, undefined, '    '));

                }

                resolve();
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
                console.log('PING  ', item.timestamp, sprintf('%s - %s', item.name, item.title));
            });
        }
        Matrix.configure(argv);
        var queue = new AnimationQueue();

        var feeds = [
            {url: 'https://digital.di.se/rss',                                        name: 'DI               '},
            {url: 'https://www.sydsvenskan.se/rss.xml?latest',                        name: 'Sydsvenskan      '},
            {url: 'http://www.svd.se/?service=rss',                                   name: 'Svenska Dagbladet'},
            {url: 'https://rss.aftonbladet.se/rss2/small/pages/sections/aftonbladet', name: 'Aftonbladet      '},
            {url: 'https://feeds.expressen.se/nyheter',                               name: 'Expressen        '},
            {url: 'http://feeds.bbci.co.uk/news/rss.xml',                             name: 'BBC              '},
            {url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',           name: 'New York Times   '}
        ];
        feeds = [
            {url: 'https://rss.aftonbladet.se/rss2/small/pages/sections/aftonbladet', name: 'Aftonbladet      '}
        ];

        feeds.forEach((feed) => {
            subscribe(feed);
        });

                
	}
    


};

new Command();



