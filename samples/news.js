
var NewsAnimation = require('../src/news-animation.js');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class extends MatrixCommand {

    constructor(options) {
        var Timer = require('yow/timer');

        super({...options, command:'news [options]', description:'Display news'});

        this.timer = new Timer();
    }

 
    options(args) {
        super.options(args);
    }

    enqueueAnimations() {
        this.queue.enqueue(new NewsAnimation({...this.argv}));
    }



	runAnimations() {
        this.enqueueAnimations();

        this.queue.on('idle', () => {
            this.timer.setTimer(3 * 60 * 1000, () => {
                this.enqueueAnimations();
            })
        });

	}




};



