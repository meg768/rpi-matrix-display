
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Request = require('yow/request');
var sprintf = require('yow/sprintf');
var Timer = require('yow/timer');
var Parser = require('rss-parser');
var Events = require('events');
const { time } = require('console');
const { emit } = require('process');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

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
        this.cache = undefined;
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
                var now = new Date();
                var someTimeAgo = new Date(now.getTime() -  12 * 60 * 60 * 1000);

                // Create a timestamp for each item
                feed.items.forEach((item) => {
                    item.timestamp = new Date(item.isoDate);
                });

                // Sort by date ASC
                feed.items.sort((a, b) => {
                    return a.timestamp.getTime() - b.timestamp.getTime();
                });

                
                // Filter out latest/relevant RSS
                feed.items = feed.items.filter((item) => {
                    if (item.timestamp.getTime() >= someTimeAgo.getTime())
                        return item;
                });

                
                if (feed.items.length > 0) {

                    if (this.cache == undefined) {

                        var cache = {};
                        var lastItem = feed.items[feed.items.length - 1];

                        feed.items.forEach((item) => {
                            var key = sprintf('%s:%s', item.isoDate, item.title);
                            cache[key] = item;
                        });

                        this.cache = cache;                        
                        this.emit('ping', {timestamp:lastItem.timestamp, name:this.name, title:lastItem.title});
                            
                    }
                    else {
                        feed.items.forEach((item) => {
                            var key = sprintf('%s:%s', item.isoDate, item.title);
    
                            if (this.cache[key] == undefined) {
                                this.emit('ping', {timestamp:item.timestamp, name:this.name, title:item.title});
                                this.cache[key] = item;
                            }
                        });
    
                    }


                    var cache = {};

                    // Clean up cache
                    for (var key in this.cache) {
                        var item = this.cache[key];

                        if (item.timestamp.getTime() >= someTimeAgo.getTime())
                            cache[key] = item;
                    }

                    //debug(JSON.stringify(cache, null, '   '));
                    this.cache = cache;

 
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

        var feeds = [
            {url: 'https://digital.di.se/rss',                                        name: 'DI               '},
            {url: 'https://www.sydsvenskan.se/rss.xml?latest',                        name: 'Sydsvenskan      '},
            {url: 'http://www.svd.se/?service=rss',                                   name: 'Svenska Dagbladet'},
            {url: 'https://rss.aftonbladet.se/rss2/small/pages/sections/aftonbladet', name: 'Aftonbladet      '},
            {url: 'https://feeds.expressen.se/nyheter',                               name: 'Expressen        '},
            {url: 'http://feeds.bbci.co.uk/news/rss.xml',                             name: 'BBC              '},
            {url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',           name: 'New York Times   '}
        ];

        var news = [];
        var timer = new Timer();
    
        function displayNews() {
            debug('------');

            var supplier = '';

            news.forEach((item) => {
                var messages = [];

                if (item.name != supplier) {
                    messages.push(item.name);
                    supplier = item.name;
                }

                messages.push(item.title);
            });            

            messages.forEach((message) => {
                debug(message);
            })

            news.forEach((item) => {
                debug('NEWS  ', item.timestamp, sprintf('%s - %s', item.name, item.title));
            });            
            debug('------');

            timer.setTimer(3 * 60000, displayNews);
        }

        function subscribe(options) {
            var feed = new Feed(options);

            feed.on('ping', (item) => {
                // Insert news at beginning
                news.unshift({timestamp:item.timestamp, name:item.name, title:item.title});

                // Keep first number of news
                news = news.slice(0, 3);

                console.log('PING  ', item.timestamp, sprintf('%s - %s', item.name, item.title));

                timer.setTimer(5000, displayNews);
            });
        }

        Matrix.configure(argv);
        var queue = new AnimationQueue();

        
        /*feeds = [
            {url: 'https://rss.aftonbladet.se/rss2/small/pages/sections/aftonbladet', name: 'Aftonbladet      '}
        ];
        */
        
        feeds.forEach((feed) => {
            subscribe(feed);
        });

        
	}
    


};

new Command();



