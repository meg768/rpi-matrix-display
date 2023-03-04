var Matrix = require('rpi-matrix');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class extends MatrixCommand {

    constructor(options) {
        var Timer = require('yow/timer');

        super({command: 'loop [options]', description: 'Loop matrix animations', ...options}); 

        this.timer = new Timer();
        this.animations = [];
        this.animationIndex = 0;
    }

    options(args) {
        super.options(args);
		args.option('news', {describe:'Display RSS news feeds', type: 'boolean', default:false});
		args.option('gif', {describe:'Display random gif animations', type: 'boolean', default:false});
		args.option('weather', {describe:'Display weather information', type: 'boolean', default:false});
        args.option('rain', {describe:'Display matrix rain', type: 'boolean', default:false});
        
        args.option('scrollDelay', {describe:'Text scroll delay in ms', type: 'number', default:10});
        args.option('textColor', {describe:'Text color', default:'red'});

    }

    runNextAnimation() {
        var animation = this.animations[this.animationIndex];
        this.animationIndex = (this.animationIndex + 1) % this.animations.length; 
        return this.queue.enqueue(animation);
    }

    setupAnimations() {
        if (this.argv.news) {
            this.animations.push(() => {
                var Animation = require('../src/news-animation.js');
                return new Animation({...this.argv});                
            });
        }

        if (this.argv.rain) {
            this.animations.push(() => {
                var Animation = require('../src/rain-animation.js');
                return new Animation({...this.argv, duration:5 * 60 * 1000});                
            });
        }

        if (this.argv.weather) {
            this.animations.push(() => {
                var Animation = require('../src/weather-animation.js');
                return new Animation({...this.argv});                
            });
        }

        if (this.argv.gif) {
            this.animations.push(() => {
                var Animation = require('../src/gif-animation.js');
                return new Animation({...this.argv, duration:5 * 60 * 1000});                
            });
        }

    }
    
	async run() {
        this.setupAnimations();
        this.runNextAnimation();

        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.runNextAnimation();
            })
        });

	}

};



