var TextAnimation = require('./text-animation.js');
let RSS = null;

module.exports = class extends TextAnimation {

    constructor(options = {}) {
        super(options);

        this.text = [];

    }

    async start() {

        if (RSS == null) {
            let feeds = [
                {'SDS':'https://www.sydsvenskan.se/rss.xml?latest'},
                {'DI':'https://digital.di.se/rss'},
                {'SvD':'http://www.svd.se/?service=rss'},
            ];

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
