var TextAnimation = require('./text-animation.js');
let RSS = null;

module.exports = class extends TextAnimation {

    constructor(options = {}) {
        super(options);

        this.text = [];

    }

    async start() {

        if (RSS == null) {

            let feeds = {
                "BBC": "http://feeds.bbci.co.uk/news/uk/rss.xml#",
                "CNN": "http://rss.cnn.com/rss/edition.rss",
                "Google": "https://news.google.com/rss?gl=US&ceid=US:en&hl=en-US"
            };            

            let RssParserEvents = require('./rss-parser-events');
            RSS = new RssParserEvents(feeds);

            RSS.on('rss', (name, rss) => {
                this.text.unshift(`${name} - ${rss.title}`);

                // Select top 5
                this.text = this.text.slice(0, 5);

            });

    
        }


        await super.start();

    }

    async stop() {
        await super.stop()
    }



	async getText() {
        return this.text;

	}



    
}
