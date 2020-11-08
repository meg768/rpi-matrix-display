
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var sprintf = require('yow/sprintf');
var Timer = require('yow/timer');
var Parser = require('rss-parser');
var Events = require('events');
var Schedule = require('node-schedule');

var rssFeeds = {
    'di': {
        url:'https://digital.di.se/rss', name: 'DI', description:'Dagens Industri', favorite: true
    },
    'sds': {
        url:'https://www.sydsvenskan.se/rss.xml?latest', name: 'SDS', description:'Sydsvenska Dagbladet', favorite: true
    },
    'sr': {
        url:'http://api.sr.se/api/rss/program/83?format=145', name: 'SR', description:'Sveriges Radio', favorite: true
    },
    'bbc': {
        url:'http://feeds.bbci.co.uk/news/rss.xml', name: 'BBC', description:'BBC', favorite: true
    },
    'svd': {
        url:'http://www.svd.se/?service=rss', name: 'SvD', description:'Svenska Dagbladet', favorite: true
    },
    'expressen': {
        url:'https://feeds.expressen.se/nyheter', name: 'Expressen', description:'Expressen', favorite: true
    },
    'nyt': {
        url:'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', name: 'New York Times', description:'New York Times', favorite: true
    },
    'aftonbladet': {
        url:'https://rss.aftonbladet.se/rss2/small/pages/sections/aftonbladet', name: 'Aftonbladet', description:'Aftonbladet', favorite: true
    }
};


var debug = function() {
}

class Feed extends Events {
    constructor(options) {
        super(options);

        var {schedule = '*/1 * * * *', url, name = 'Noname'} = options;

        this.url = url;
        this.name = name;
        this.parser = new Parser();
        this.cache = undefined;
        this.schedule = schedule;

        this.fetch();

        Schedule.scheduleJob(schedule, () => {
            this.fetch();
        });
    }

    fetch() {
        return new Promise((resolve, reject) => {

            debug(sprintf('Fetching RSS for %s...', this.name));

            this.parser.parseURL(this.url).then((feed) => {

                function makeKey(item) {
                    return sprintf('%s:%s', item.isoDate, item.title);
                }

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
                        // If first time, take only the last feed to ping and 
                        // store the rest in cache

                        var cache = {};
                        var lastItem = feed.items[feed.items.length - 1];

                        feed.items.forEach((item) => {
                            cache[makeKey(item)] = item;
                        });

                        this.cache = cache;                        
                        this.emit('ping', {timestamp:lastItem.timestamp, name:this.name, title:lastItem.title});
                            
                    }
                    else {
                        feed.items.forEach((item) => {
                            var key = makeKey(item);
    
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

                    this.cache = cache;

 
                }

                debug(sprintf('Finished fetching RSS feed %s.', this.name));
                resolve();
            })
            .catch((error) => {
                console.error(error);
                reject(error);

            })
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
        args.option('textColor', {describe:'Specifies text color', alias:['color'], default:'red'});
        args.option('schedule', {describe:'Display frequency in cron format', default:'30 */2 * * * *'});
        args.option('debug', {describe:'Debug mode', type:'boolean', default:false});

        for (var key in rssFeeds) {
            var item = rssFeeds[key];
            var {description, favorite} = item;
            args.option(key, {describe:sprintf('Show news from %s', description), type:'boolean', default:favorite});
        }

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }


	run(argv) {
        if (argv.debug != undefined && !argv.debug)
            delete argv.debug;

        if (argv.debug) {
            debug = console.log;
        }

        console.log(argv);

        Matrix.configure(argv);


        var news = [];
        var timer = new Timer();
        var queue = new AnimationQueue();
        var feeds = [];

        for (var key in rssFeeds) {
            var item = rssFeeds[key];

            if (argv[key]) {
                debug(sprintf('Subscribing to %s - url %s'), item.name, item.url);
                subscribe({url:item.url, name:item.name});
            }
        }


        function displayNews() {
            news.forEach((item) => {
                var text = sprintf('%s - %s', item.name, item.title);
                debug(sprintf('Displaying %s...', text));
                queue.enqueue(new TextAnimation({textColor:argv.textColor, text:text}));
            });            
        }


        function subscribe(options) {
            var feed = new Feed(options);

            feed.on('ping', (item) => {
                // Insert news at beginning
                news.unshift({timestamp:item.timestamp, name:item.name, title:item.title});

                // Keep first number of news
                news = news.slice(0, 3);

                debug('Ping', item.timestamp, sprintf('%s - %s', item.name, item.title));

                timer.setTimer(5000, displayNews);
            });

            feeds.push(feed);
        }

        
        queue.on('idle', () => {
            timer.setTimer(5 * 60 * 1000, displayNews);
        });
        

	}
    


};

new Command();



