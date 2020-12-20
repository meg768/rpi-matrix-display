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
		args.option('gif', {describe:'Display random gif animations', type: 'boolean', default:true});
		args.option('weather', {describe:'Display weather information', type: 'boolean', default:true});
        args.option('rain', {describe:'Display matrix rain', type: 'boolean', default:true});
        
        args.option('scrollDelay', {describe:'Text scroll delay in ms', type: 'number', default:10});

    }

    runNextAnimation() {
        var animation = this.animations[this.animationIndex];
        this.animationIndex = (this.animationIndex + 1) % this.animations.length; 
        return this.queue.enqueue(animation());
    }

    setupAnimations() {
        if (this.argv.news) {
            this.animations.push(() => {
                var Animation = require('../src/news-animation.js');
                return new Animation({...this.argv});                
            });
        }

        if (this.argv.weather) {
            this.animations.push(() => {
                var Animation = require('../src/weather-animation.js');
                return new Animation({...this.argv});                
            });
        }

        if (this.argv.rain) {
            this.animations.push(() => {
                var Animation = require('../src/rain-animation.js');
                return new Animation({...this.argv, duration:2000});                
            });
        }

        if (this.argv.gif) {
            this.animations.push(() => {
                var Animation = require('../src/gif-animation.js');
                return new Animation({...this.argv, duration:2000});                
            });
        }

    }
    
	runAnimations() {
        this.setupAnimations();
        this.runNextAnimation();

        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.runNextAnimation();
            })
        });

	}

};



