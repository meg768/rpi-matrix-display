
var sprintf = require('yow/sprintf');
var Parser = require('rss-parser');

var feeds = [
    {url:'https://www.sydsvenskan.se/rss.xml?latest',                        name: 'SDS',            description:'Sydsvenska Dagbladet'},
    {url:'https://digital.di.se/rss',                                        name: 'DI',             description:'Dagens Industri'},
    //{url:'http://api.sr.se/api/rss/program/83?format=145',                   name: 'SR',             description:'Sveriges Radio'},
    //{url:'http://feeds.bbci.co.uk/news/rss.xml',                             name: 'BBC',            description:'BBC'},
    {url:'http://www.svd.se/?service=rss',                                   name: 'SvD',            description:'Svenska Dagbladet'},
    {url:'https://feeds.expressen.se/nyheter',                               name: 'Expressen',      description:'Expressen'},
    //{url:'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',           name: 'New York Times', description:'New York Times'},
    {url:'https://rss.aftonbladet.se/rss2/small/pages/sections/aftonbladet', name: 'Aftonbladet',    description:'Aftonbladet'}
];


var debug = console.log;


module.exports = class LatestNews {

    constructor() {
        this.parser = new Parser();
        this.cache = {};
    }


    fetchFeed(feed) {

        return new Promise((resolve, reject) => {

            debug(sprintf('Fetching RSS for %s...', feed.name));

            this.parser.parseURL(feed.url).then((result) => {

                result.items.forEach((item) => {
                    var key = sprintf('%s:%s', item.isoDate, item.title);
                    var news = {};
                    news.timestamp   = new Date(item.isoDate);
                    news.name        = feed.name;
                    news.description = feed.description;
                    news.text        = item.title;
                    this.cache[key] = news;
                });
 
                debug(sprintf('Done fetching RSS for %s...', feed.name));
                resolve();
            })
            .catch((error) => {
                reject(error);

            })
        });
    }

    fetch() {

        return new Promise((resolve, reject) => {

            var promise = Promise.resolve();

            feeds.forEach((feed) => {
                promise.then(() => {
                    promise = this.fetchFeed(feed);
                });
            });

            promise.then(() => {

                debug('asdfgasdf');
                var now = new Date();
                var someTimeAgo = new Date(now.getTime() -  1000 * 60 * 60 * 1000);
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

                // Sort by date ASC
                news.sort((a, b) => {
                    return a.timestamp.getTime() - b.timestamp.getTime();
                });

                // Select top 5
//                news = news.slice(0, 5);

                // Save cache for later
                this.cache = cache;

                debug(news);
                resolve(news);
            })
            .catch((error) => {
                reject(error);
            })
        });



    }
}
