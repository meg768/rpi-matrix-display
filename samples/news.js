
var TextAnimation = require('../src/text-animation.js');
var NewsFeed = require('../src/news-feed.js');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class extends MatrixCommand {

    constructor(options) {
        var Timer = require('yow/timer');

        super({...options, command:'news [options]', description:'Display news'});

        this.timer = new Timer();
    }

 
    options(args) {
        super.options(args);
    }

    enqueueAnimations() {
        var sprintf = require('yow/sprintf');

        return new Promise((resolve, reject) => {

            var feed = new NewsFeed(this.argv);
    
            feed.fetch().then((news) => {
                news.forEach((item) => {
                    var text = sprintf('%s - %s', item.description, item.title);
                    this.queue.enqueue(new TextAnimation({...this.argv, text:text}));
                });

                resolve();
            })
            .catch((error) => {
                reject(error);
            });
        });
    }



	runAnimations() {
        this.enqueueAnimations();

        this.queue.on('idle', () => {
            this.timer.setTimer(3 * 60 * 1000, () => {
                this.enqueueAnimations();
            })
        });

	}




};



