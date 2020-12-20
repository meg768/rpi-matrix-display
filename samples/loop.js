var Matrix = require('rpi-matrix');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class WeatherCommand extends MatrixCommand {

    constructor(options) {
        var Timer = require('yow/timer');

        super({command: 'loop [options]', description: 'Loop matrix animations', ...options}); 

        this.timer = new Timer();
        this.animations = [];
        this.counter = 0;
    }

    options(args) {
        super.options(args);
		args.option('news', {describe:'Display RSS news feeds', type: 'boolean', default:true});
		args.option('gif', {describe:'Display random gif animations', type: 'boolean', default:true});
		args.option('weather', {describe:'Display weather information', type: 'boolean', default:true});
		args.option('rain', {describe:'Display matrix rain', type: 'boolean', default:true});
    }

    runNextAnimation() {
        var runAnimation = this.animations[this.index];

        this.index = (this.index + 1) % this.animations.length;
        this.queue.enqueue(runAnimation());
    }

	runAnimations() {
        if (this.argv.news) {
            var Animation = require('../src/news-animation.js');

            this.animations.push(() => {
                return new Animation({...this.argv});
            });
        }

        if (this.argv.weather) {
            var Animation = require('../src/weather-animation.js');

            this.animations.push(() => {
                return new Animation({...this.argv});
            });
        }


        if (this.argv.rain) {
            var Animation = require('../src/rain-animation.js');

            this.animations.push(() => {
                return new Animation({...this.argv, duration:2000});
            });
        }

        if (this.argv.gif) {
            var Animation = require('../src/gif-animation.js');

            if (Matrix.width == Matrix.height) {
                this.animations.push(() => {
                    return new Animation({...this.argv, duration:2000});
                });    
            }
        }

        this.runNextAnimation();

        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.runNextAnimation();
            })
        });

	}

};



