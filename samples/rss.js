
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class extends MatrixCommand {

    constructor(options) {
        super({...options, command:'rss [options]', description:'Display RSS'});

    }

 
    options(args) {
        super.options(args);
        args.option('textColor', {describe:'Text color', default:'red'});
        args.option('scrollDelay', {describe:'Scrolling speed', default:10});
        args.option('fontSize', {describe:'Size of font relative to height of matrix', default:0.65});
    }


    async start() {
        let RSS = require('../src/rss-parser-events');
        let TextAnimation = require('../src/text-animation');

        let feeds = {
            "BBC": "http://feeds.bbci.co.uk/news/uk/rss.xml#",
            "CNN": "http://rss.cnn.com/rss/edition.rss",
            "Google": "https://news.google.com/rss?gl=US&ceid=US:en&hl=en-US"
        };
    
        let options = {
            interval:1
        };

        this.rss = new RSS(feeds, options);

        this.rss.on('rss', (name, rss) => {
            let text = `${name} - ${rss.title}`;
            console.log(text);

            this.queue.enqueue(new TextAnimation({...this.argv, text:text}));            
        });

    }

	async run() {

	}




};



