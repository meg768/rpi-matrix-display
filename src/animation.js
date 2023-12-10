//module.exports = require('rpi-animations').Animation;

var Sleep = require('sleep');
var Events = require('events');

function isNumber(value) {
    return typeof value == 'number';
} 

module.exports = class extends Events {


	constructor(options = {}) {

		super();
	
		var {debug, renderFrequency = undefined, name = 'Noname', priority = 'normal', iterations = undefined, duration = undefined} = options;
	
		this.name            = name;
		this.priority        = priority;
		this.cancelled       = false;
		this.duration        = duration;
		this.iterations      = iterations;
		this.renderFrequency = renderFrequency;
		this.renderTime      = undefined;
		this.debug           = typeof debug === 'function' ? debug : (debug ? console.log : () => {});
	}

    render() {
        this.debug('Animation.render() should not be called!');
    }

    sleep(ms) {
        Sleep.msleep(ms);
    }

    start() {
        this.debug('Starting animation', this.name);

        return new Promise((resolve, reject) => {

            this.cancelled  = false;
            this.renderTime = undefined;
            this.iteration  = typeof this.iterations == 'number' ? 0 : undefined;

            this.debug('Animation', this.name, 'started.');
            resolve();

            this.emit('started');
        });

    }

    stop() {
        this.debug('Stopping animation', this.name);

        return new Promise((resolve, reject) => {
            this.debug('Animation', this.name, 'stopped.');

            resolve();
            this.emit('stopped');
        });
    }

	next(loop) {
        setImmediate(loop);
    }

    loop() {
        this.debug(`Running loop ${this.name}...`);
        var start = new Date();

        return new Promise((resolve, reject) => {

            var render = () => {
                var now = new Date();

                if (this.renderFrequency == undefined || this.renderTime == undefined || now - this.renderTime >= this.renderFrequency) {
                    this.debug(`Rendering ${this.name}...`);
                    this.render();
                    this.renderTime = now;
                }

            };

            var loop = () => {
                var now = new Date();

                if (this.cancelled) {
                    this.emit('cancelled');
                    resolve();
                }
                else if (isNumber(this.duration) && this.duration > 0 && now - start > this.duration) {
                    resolve();
                }
                else if (isNumber(this.iterations) && isNumber(this.iteration) && this.iterations > 0 && this.iteration >= this.iterations) {
                    resolve();
                }
                else {
                    render();

                    if (isNumber(this.iteration))
                        this.iteration++;

                    this.next(loop);
                }
            }

            loop();
        });
    }

    cancel() {
        this.debug('Cancelling animation', this.name);
        this.cancelled = true;
        this.emit('cancelling');
    }

    run(options) {

        if (options) {
            var {priority = this.priority, duration = this.duration} = options;

            this.priority  = priority;
            this.duration  = duration;
    
        }


        return new Promise((resolve, reject) => {

            this.start().then(() => {
                return this.loop();
            })
            .then(() => {
                return this.stop();
            })
            .catch((error) => {
                this.debug(error);
            })
            .then(() => {
                resolve();
            });

        });

    }
}
