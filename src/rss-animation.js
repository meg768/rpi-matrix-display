var TextAnimation = require('./text-animation.js');
let RSS = require('./rss-parser-events');
let rss = null;

module.exports = class extends TextAnimation {

    constructor(options = {}) {
        super(options);

        this.text = [];

    }

    async start() {

        if (rss == null) {

            let feeds = {
                "BBC": "http://feeds.bbci.co.uk/news/uk/rss.xml#",
                "CNN": "http://rss.cnn.com/rss/edition.rss",
                "Google": "https://news.google.com/rss?gl=US&ceid=US:en&hl=en-US"
            };

            let options = {
                interval:1
            }

            rss = new RSS(feeds, options);

            rss.on('rss', (name, rss) => {
                this.text.push(`${name} - ${rss.title}`);


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
