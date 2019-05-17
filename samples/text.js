
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('../src/animation-queue.js');

class Command {

    constructor() {
        module.exports.command  = 'text [options]';
        module.exports.describe = 'Scroll text';
        module.exports.builder  = this.defineArgs;
        module.exports.handler  = this.run;
        
    }

    defineArgs(args) {

        args.usage('Usage: $0 [options]');

        args.option('help', {describe:'Displays this information'});
        args.option('text', {describe:'Text to display', default:'Hello World'});
        args.option('textColor', {describe:'Specifies text color'});

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }


    run(argv) {

        Matrix.configure(argv);

        try {

            var queue = new AnimationQueue();

            var A = new TextAnimation(argv);
            var B = new TextAnimation({...argv, ...{text:'Thats all folks! :sunglasses:', textColor:'blue'}});

            queue.enqueue(A);
//            queue.enqueue(B);

            queue.dequeue().then(() => {
                console.log('Done!')
            })
            .catch(error => {
                console.error(error.stack);
            })
        }
        catch (error) {
            console.error(error.stack);
        }

    }
    


};

new Command();



