
var Matrix = require('rpi-matrix');
var GifAnimation = require('../src/gif-animation.js');


class Command {

    constructor() {
        module.exports.command  = 'animate [options]';
        module.exports.describe = 'Animate gifs';
        module.exports.builder  = this.defineArgs;
        module.exports.handler  = this.run;
        
    }

    defineArgs(args) {

		args.usage('Usage: $0 animate [options]');

		args.option('help', {describe:'Displays this information'});
		args.option('gif',  {describe:'Specifies name of GIF', default:'pacman'});
		args.option('duration', {describe:'Animate for a specified time (ms)'});
		args.option('iterations', {describe:'Number of iterations to animate'});

		args.wrap(null);

		args.check(function(argv) {
			return true;
		});

		return args.argv;
	}


	run(argv) {

		try {

            Matrix.configure(argv);
			var sample = new GifAnimation(argv);
			sample.run();
		}
		catch (error) {
			console.error(error.stack);
		}

    }
    


};

new Command();



