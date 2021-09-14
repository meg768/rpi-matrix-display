
var TextAnimation = require('../src/text-animation.js');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class extends MatrixCommand {

    constructor(options) {
        var Timer = require('yow/timer');

        super({...options, command:'text [options]', description:'Display text'});

        this.timer = new Timer();
    }

 
    options(args) {
        super.options(args);
        args.option('textColor',   {describe: 'Text color', default:'red'});
        args.option('iterations',  {describe: 'Number of iterations to animate each animation'});
        args.option('text',        {describe: 'Text to display', default:'ABC 123'});
        args.option('emojiSize',   {describe: 'Size of emojis relative to matrix height', default:0.75});
        args.option('fontStyle',   {describe: 'Font style', default:'bold'});
        args.option('fontName',    {describe: 'Font name', default:'Arial'});
        args.option('scrollDelay', {describe: 'Scrolling speed', default:10});

    }

    enqueueAnimations() {
        this.queue.enqueue(new TextAnimation({...this.argv}));
    }


	async run() {
        this.enqueueAnimations();

        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.enqueueAnimations();
            })
        });
    }




};



