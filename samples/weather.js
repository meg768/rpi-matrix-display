
var WeatherFeed = require('../src/weather-feed.js');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class WeatherCommand extends MatrixCommand {

    constructor(options) {
        super({command: 'weather [options]', description: 'Display weather', ...options}); 
    }

    options(args) {
        super.options(args);
		args.option('textColor', {describe:'Text color', default:'red'});
    }
    
    enqueueAnimations() {
        return new Promise((resolve, reject) => {

            var feed = new WeatherFeed(this.argv);
    
            feed.fetch().then((items) => {
                items.forEach((item) => {
                    this.queue.enqueue(new TextAnimation({...this.argv, text:item}));
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
            this.timer.SetTimer(60 * 1000, () => {
                this.enqueueAnimations();
            })
        });

	}

};



