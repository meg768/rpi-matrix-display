var Matrix = require('rpi-matrix');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class WeatherCommand extends MatrixCommand {

    constructor(options) {
        var Timer = require('yow/timer');

        super({command: 'loop [options]', description: 'Loop matrix animations', ...options}); 

        this.timer = new Timer();
        this.animations = [];
        this.animationIndex = 0;
    }

    options(args) {
        super.options(args);
		args.option('news', {describe:'Display RSS news feeds', type: 'boolean', default:true});
		args.option('gif', {describe:'Display random gif animations', type: 'boolean', default:false});
		args.option('weather', {describe:'Display weather information', type: 'boolean', default:false});
        args.option('rain', {describe:'Display matrix rain', type: 'boolean', default:false});
        
        args.option('scrollDelay', {describe:'Text scroll delay in ms', type: 'number', default:10});

    }

    runWeatherAnimation() {
        var Animation = require('../src/weather-animation.js');
        this.queue.enqueue(new Animation({...this.argv}));

    }

    runNewsAnimation() {
        var Animation = require('../src/news-animation.js');
        this.queue.enqueue(new Animation({...this.argv}));

    }

    runRainAnimation() {
        var Animation = require('../src/rain-animation.js');
        this.queue.enqueue(new Animation({...this.argv, duration:2000}));
    }

    runGifAnimation() {
        var Animation = require('../src/gif-animation.js');
        this.queue.enqueue(new Animation({...this.argv, duration:2000}));
    }

    runNextAnimation() {
        var animation = this.animations[this.animationIndex];
        this.animationIndex = (this.animationIndex + 1) % this.animations.length;
        return animation();
    }

	runAnimations() {
        if (this.argv.news)
            this.animations.push(this.runNewsAnimation);

        if (this.argv.weather)
            this.animations.push(this.runWeatherAnimation);

        if (this.argv.gif)
            this.animations.push(this.runGifAnimation);

        if (this.argv.rain)
            this.animations.push(this.runRainAnimation);

        this.runNextAnimation();

        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.runNextAnimation();
            })
        });

	}

};



