
var MatrixCommand = require('../src/matrix-command.js');
var WeatherAnimation = require('../src/weather-animation.js');

module.exports = class WeatherCommand extends MatrixCommand {

    constructor(options) {
        var Timer = require('yow/timer');

        super({command: 'weather [options]', description: 'Display weather', ...options}); 

        this.timer = new Timer();
    }

    options(args) {
        super.options(args);
		args.option('textColor', {describe:'Text color', default:'red'});
    }

    enqueueAnimations() {
        this.queue.enqueue(new WeatherAnimation({...this.argv}));
    }

	async run() {
        this.enqueueAnimations();

        this.queue.on('idle', () => {
            this.timer.setTimer(5 * 1000, () => {
                this.enqueueAnimations();
            })
        });

	}

};



