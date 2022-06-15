var TextAnimation = require('./text-animation.js');
let headlines = [];

function startUp() {
    let RSS = require('./rss-parser-events');

    let feeds = {
        "BBC": "http://feeds.bbci.co.uk/news/uk/rss.xml#",
        "CNN": "http://rss.cnn.com/rss/edition.rss",
        "Google": "https://news.google.com/rss?gl=US&ceid=US:en&hl=en-US"
    };

    let options = {
        interval:1
    }

    let rss = new RSS(feeds, options);

    rss.on('rss', (name, rss) => {
        let text = `${name} - ${rss.title}`;
        console.log(text);
        headlines.push(text);
    });

}


module.exports = class extends TextAnimation {

    constructor(options = {}) {
        super(options);

    }

    async start() {

        await super.start();

    }

    async stop() {
        await super.stop()
    }



	async getText() {
        return headlines;

	}



    
}
