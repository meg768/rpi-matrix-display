
var TextAnimation = require('../src/text-animation.js');
var AnimationCommand = require('../src/animation-command.js');

module.exports = class extends AnimationCommand {

    constructor(options) {
        var Timer = require('yow/timer');

        super({...options, command:'text [options]', description:'Display text'});

        this.timer = new Timer();
    }

 
    options(args) {
        super.options(args);
		args.option('duration', { describe: 'Animate for a specified time (ms)', default:30000});
		args.option('iterations', { describe: 'Number of iterations to animate'});
		args.option('textColor', {describe:'Text color', default:'red'});

    }

    enqueueAnimations() {
        this.queue.enqueue(new TextAnimation({...this.argv}));
    }



	runAnimations() {
        this.enqueueAnimations();

        this.queue.on('idle', () => {
            this.timer.setTimer(5 * 1000, () => {
                this.enqueueAnimations();
            })
        });

	}




};



