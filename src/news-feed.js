
var sprintf = require('yow/sprintf');
var Parser = require('rss-parser');
var isFunction = require('yow/isFunction');
var isString = require('yow/isString');





module.exports = class NewsFeed {

    constructor(options) {
        var debug = {options}

        this.parser = new Parser();
        this.cache = {};
        this.debug = () => {};

        this.feeds = [
            {url:'https://www.sydsvenskan.se/rss.xml?latest',                        name: 'SDS',            description:'Sydsvenska Dagbladet'},
            {url:'https://digital.di.se/rss',                                        name: 'DI',             description:'Dagens Industri'},
            //{url:'http://api.sr.se/api/rss/program/83?format=145',                   name: 'SR',             description:'Sveriges Radio'},
            //{url:'http://feeds.bbci.co.uk/news/rss.xml',                             name: 'BBC',            description:'BBC'},
            {url:'http://www.svd.se/?service=rss',                                   name: 'SvD',            description:'Svenska Dagbladet'},
            {url:'https://feeds.expressen.se/nyheter',                               name: 'Expressen',      description:'Expressen'},
            //{url:'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',           name: 'New York Times', description:'New York Times'},
            {url:'https://rss.aftonbladet.se/rss2/small/pages/sections/aftonbladet', name: 'Aftonbladet',    description:'Aftonbladet'}
        ];

        if (isFunction(debug))
            this.debug = debug;
        else if (debug != undefined) {
            if (isString(debug) && Number(debug))
                this.debug = console.log;
            else if (debug)
                this.debug = console.log;
        }
    }


    fetchFeed(feed) {

        return new Promise((resolve, reject) => {

            this.debug('Fetching ', feed.name);

            this.parser.parseURL(feed.url).then((result) => {

                result.items.forEach((item) => {
                    var key = sprintf('%s:%s', item.isoDate, item.title);
                    var news = {};
                    news.timestamp   = new Date(item.isoDate);
                    news.name        = feed.name;
                    news.description = feed.description;
                    news.text        = item.title;

                    this.cache[key]  = news;
                });
 
                resolve();
            })
            .catch((error) => {
                reject(error);

            })
        });
    }

    fetch() {

        return new Promise((resolve, reject) => {

            var promises = [];
            
            this.feeds.forEach((feed) => {
                promises.push(this.fetchFeed(feed));
            });

            Promise.all(promises).then(() => {

                var now = new Date();
                var someTimeAgo = new Date(now.getTime() -  1 * 24 * 60 * 60 * 1000);
                var news = [];        
                var cache = {};
        
                // Remove old entries
                for (var key in this.cache) {
                    var item = this.cache[key];
        
                    if (item.timestamp.getTime() >= someTimeAgo.getTime())
                        cache[key] = item;
                }

                for (var key in cache) {
                    news.push(cache[key]);
                }

                // Sort by date DESC
                news.sort((a, b) => {
                    return b.timestamp.getTime() - a.timestamp.getTime();
                });

                // Select top 5
                news = news.slice(0, 5);

                // Save cache for later
                this.cache = cache;

                this.debug(news);

                resolve(news);
            })
            .catch((error) => {
                reject(error);
            })
        });



    }
}
