var Events = require('events');

class RSS extends Events {

    constructor(options = {}) {
        super(options);

		var now = new Date();
		this.debug = console.log;
		this.timestamp = new Date(now.getTime() -  1 * 60 * 60 * 1000);
	

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
		var Parser = require('rss-parser');
        var parser = new Parser();

		this.debug(`Fetching ${feed.url}...`);
		var rss = await parser.parseURL(feed.url);
		this.debug(`Finished fetching from ${feed.url}...`);

		var result = [];

		rss.items.forEach((item) => {
			result.push({
				timestamp:   new Date(item.isoDate),
				name:        feed.name,
				description: feed.description,
				title:       item.title
			});
		});

		return result;

    }

	async fetchAll(feeds) {

		var result = [];

		await Promise.all(feeds.map(async (feed) => {
			try {

				var rss = await this.fetch(feed);

				rss.forEach(item => {
					result.push(item);
				})
			}
			catch(error) {
				this.debug(`Failed to fetch from feed ${feed.url}`);
			}
		})); 

		return result;

	}

	start() {

	}

	async run() {

		var now = new Date();
		var someTimeAgo = this.timestamp; //new Date(now.getTime() -  1 * 60 * 60 * 1000);
		var result = await this.fetchAll(this.feeds);

		// Sort by date DESC
		result.sort((a, b) => {
			return b.timestamp.getTime() - a.timestamp.getTime();
		});

		// Filter out old items
		result = result.filter(item => {
			return (item.timestamp.getTime() >= someTimeAgo.getTime())
		});

		result.forEach(item => {
			this.debug(`${item.timestamp} - ${item.description} - ${item.title}`);
		});

		this.timestamp = result[0].timestamp;
		return await run();

		return result;
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
//		news = news.slice(0, 500);

		// Save cache for later
		this.cache = cache;

		var text = [];

		news.forEach((item) => {
			text.push(`${item.timestamp} - ${item.description} - ${item.title}`);
		});

		this.debug(text);
		return text;
	}



    
}

async function run() {
	var rss = new RSS();
	rss.on('news', () => {

	});
	await rss.run();
}

run();