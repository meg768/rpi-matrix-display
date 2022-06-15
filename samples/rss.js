
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class extends MatrixCommand {

    constructor(options) {
        var Timer = require('yow/timer');

        super({...options, command:'rss [options]', description:'Display RSS'});

        this.timer = new Timer();
    }

 
    options(args) {
        super.options(args);
        args.option('textColor', {describe:'Text color', default:'red'});
        args.option('scrollDelay', {describe:'Scrolling speed', default:10});
        args.option('fontSize', {describe:'Size of font relative to height of matrix', default:0.65});
    }

    enqueueAnimations() {
        var Animation = require('../src/rss-animation.js');
        this.queue.enqueue(new Animation({...this.argv}));
    }



	async run() {
        this.enqueueAnimations();

        this.queue.on('idle', () => {
            this.timer.setTimer(5  * 1000, () => {
                this.enqueueAnimations();
            })
        });

	}




};



