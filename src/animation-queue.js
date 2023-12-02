//module.exports = require('rpi-animations').Queue;


var Events = require('events');

module.exports = class AnimationQueue extends Events {

        constructor(options = {}) {
            var {debug} = options;

            super();

            this.currentAnimation = undefined;
            this.animationQueue   = [];
            this.busy             = false;
            this.debug            = () => {};

			if (typeof debug === 'function') {
				this.debug = debug;
			}
			else if (debug) {
				this.debug = console.log;
			}

            this.debug = console.log;
	
        }



		dequeue() {
			return new Promise((resolve, reject) => {
				if (this.animationQueue.length > 0) {

					this.currentAnimation = this.animationQueue.splice(0, 1)[0];

					this.currentAnimation.run().then(() => {
						return this.dequeue();
					})
					.then(() => {
						this.currentAnimation = undefined;
						resolve();
					})
					.catch((error) => {
						this.currentAnimation = undefined;
						reject(error);
					});
				}
				else {
					resolve();
				}

			});
		}

		run() {
			return dequeue();
		}


		enqueue(animation) {

            this.debug(`Enqueuing ${animation.name}...`);

			var priority = animation.priority;

			if (priority == 'low' && this.busy)
				return;

			if (priority == '!') {
				this.animationQueue = [animation];

				if (this.currentAnimation != undefined) {
					this.currentAnimation.cancel();
				}
			}
			else if (priority == 'high') {
				this.animationQueue.unshift(animation);
			}
			else {
                // Remove blocking animations
                if (this.currentAnimation != undefined) {

                    let {name, duration, priority} = this.currentAnimation;

                    this.debug(`${name} ${priority} ${duration}`);
                    if (this.currentAnimation.duration < 0)
                        this.currentAnimation.cancel();
				}

				this.animationQueue.push(animation);
			}

			if (!this.busy) {
				this.busy = true;

				this.dequeue().catch((error) => {
					console.log(error);
				})
				.then(() => {
					this.busy = false;

                    this.emit('idle');
					this.debug('Entering idle mode...');

				})

			}
		}

}
