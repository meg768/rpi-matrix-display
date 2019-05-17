
var Matrix = require('../matrix.js');
var RainAnimation = require('../src/js/rain-animation.js');

class Command {

    constructor() {
        module.exports.command  = 'rain [options]';
        module.exports.describe = 'Fill matrix with rain';
        module.exports.builder  = this.defineArgs;
        module.exports.handler  = this.run;
        

    }

    defineArgs(args) {

		args.usage('Usage: $0 rain [options]');
		
		args.option('help', {describe:'Displays this information'});
		args.option('duration', {describe:'Animation duration in milliseconds', default:-1});

		args.wrap(null);

		args.check(function(argv) {
			return true;
		});

		return args.argv;
	}


	run(argv) {

		try {
			
			Matrix.configure(argv);

            var animation = new RainAnimation(argv);
            
			animation.run();
		}
		catch (error) {
			console.error(error.stack);
		}

    }

};

new Command();



