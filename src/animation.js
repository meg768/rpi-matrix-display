//var Sleep = require('sleep');
var Events = require('events');

module.exports = class extends Events {

    constructor(options = {}) {
        super();

        var {debug, renderFrequency = undefined, renderDelay = undefined, name = 'Noname', priority = 'normal', iterations = undefined, duration = undefined} = options;

        this.name            = name;
        this.priority        = priority;
        this.cancelled       = false;
        this.duration        = duration;
        this.iterations      = iterations;
		this.renderTime      = undefined;
        this.renderFrequency = renderFrequency;
        this.renderDelay     = renderDelay;
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
            this.iteration  = 0;

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
		if (this.renderDelay == undefined) {
			console.log('set immediate');
			setImmediate(loop);

		}
		else {
			console.log('delayt', this.renderDelay);
			setTimeout(loop, this.renderDelay);

		}
	}

    loop() {
        var start = new Date();

        return new Promise((resolve, reject) => {

            var render = () => {
                var now = new Date();

                if (this.renderFrequency == undefined || this.renderFrequency == 0 || this.renderTime == undefined || now - this.renderTime >= this.renderFrequency) {
                    this.debug(`Rendering ${this.name}...`);
                    this.render();
                    this.renderTime = now;
                }

            };

            var loop = () => {
                var now = new Date();

                if (this.cancelled) {
                    this.emit('cancelled');
                    this.emit('canceled');
            
                    resolve();
                }
                else if (this.duration != undefined && (this.duration >= 0 && now - start > this.duration)) {
                    resolve();
                }
                else if (this.iterations != undefined && (this.iteration >= this.iterations)) {
                    resolve();
                }
                else {
                    render();

                    if (this.iterations != undefined)
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
        this.emit('canceling');
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
