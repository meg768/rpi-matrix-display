
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



