
var Matrix = require('rpi-matrix');
var GifAnimation = require('../src/gif-animation.js');


function configureMatrix(options) {

	var params = ['led-rows', 'led-cols'];
	var defaultOptions = {};

	params.forEach((param) => {
		var name = param;
		
		name = name.toUpperCase();
		name = name.replace('-', '_');
console.log(name);
		var value = process.env[name];

		if (value != undefined) {
			defaultOptions[param] = value;
		}
	});

	console.log('Default options', defaultOptions);

	var config = {...defaultOptions, ...options};
	console.log('config', config);
	Matrix.configure(config);

}
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

			//Matrix.configure(argv);
			configureMatrix();
			var sample = new GifAnimation(argv);
			sample.run();
		}
		catch (error) {
			console.error(error.stack);
		}

    }
    


};

new Command();



