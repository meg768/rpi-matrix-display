var TextAnimation = require('./text-animation.js');

module.exports = class extends TextAnimation {

    constructor(options = {}) {
        super(options);

        var Parser = require('rss-parser');

        this.parser = new Parser();
        this.cache = {};

        this.feeds = [
            {url:'https://www.sydsvenskan.se/rss.xml?latest',                        name: 'SDS',            description:'Sydsvenska Dagbladet'},
            {url:'https://digital.di.se/rss',                                        name: 'DI',             description:'Dagens Industri'},
            //{url:'http://api.sr.se/api/rss/program/83?format=145',                   name: 'SR',             description:'Sveriges Radio'},
            //{url:'http://feeds.bbci.co.uk/news/rss.xml',                             name: 'BBC',            description:'BBC'},
            {url:'http://www.svd.se/?service=rss',                                   name: 'SvD',            description:'Svenska Dagbladet'},
            {url:'https://feeds.expressen.se/nyheter',                               name: 'Expressen',      description:'Expressen'},
            //{url:'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',           name: 'New York Times', description:'New York Times'},
            {url:'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt', name: 'Aftonbladet',    description:'Aftonbladet'}
        ];

		

    }


    async fetch(feed) {
        var sprintf = require('yow/sprintf');

		this.debug(`Fetching ${feed.url}...`);
		var result = await this.parser.parseURL(feed.url);
		this.debug(`Finished fetching from ${feed.url}...`);

		result.items.forEach((item) => {
			var key = sprintf('%s:%s', item.isoDate, item.title);
			var news = {};

			news.timestamp   = new Date(item.isoDate);
			news.name        = feed.name;
			news.description = feed.description;
			news.title       = item.title;

			this.cache[key]  = news;
		});

		this.debug(this.cache);


/*
        return new Promise((resolve, reject) => {


            this.parser.parseURL(feed.url).then((result) => {

                result.items.forEach((item) => {
                    var key = sprintf('%s:%s', item.isoDate, item.title);
                    var news = {};
                    news.timestamp   = new Date(item.isoDate);
                    news.name        = feed.name;
                    news.description = feed.description;
                    news.title       = item.title;

                    this.cache[key]  = news;
                });
 
                resolve();
            })
            .catch((error) => {
                reject(error);

            })
        });
		*/
    }

	async getText() {
		Promise.all(this.feeds.map(async (feed) => {
			try {
				await this.fetch(feed);
			}
			catch(error) {
				this.debug(`Failed to fetch from feed ${feed.url}`);
			}
		})); 

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

		var text = [];

		news.forEach((item) => {
			text.push(`${item.description} - ${item.title}`);
		});

		this.debug(text);
		return text;
	}


    getTextOld() {

        return new Promise((resolve, reject) => {

            var promises = [];
            
            this.feeds.forEach((feed) => {

				
				try {
					var promise = this.fetch(feed);

				}
				catch(error) {

				}
                promises.push(this.fetch(feed));
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

                var text = [];

                news.forEach((item) => {
                    text.push(`${item.description} - ${item.title}`);
                });

                resolve(text);
            })
            .catch((error) => {
                reject(error);
            })
        });
    }


    
}

