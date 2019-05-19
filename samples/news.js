
var Matrix = require('rpi-matrix');
var NewsAnimation = require('../src/news-animation.js');

class Command {

    constructor() {
        module.exports.command  = 'news [options]';
        module.exports.describe = 'Display news';
        module.exports.builder  = this.defineArgs;
        module.exports.handler  = this.run;
        
    }

    defineArgs(args) {

        args.usage('Usage: $0 [options]');

        args.option('help', {describe:'Displays this information'});
        args.option('textColor', {describe:'Specifies text color'});
        args.option('category', {describe:'News category', choices:['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']});

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }


    run(argv) {

        Matrix.configure(argv);

        try {

            var animation = new NewsAnimation(argv);

            animation.run().then(() => {
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



