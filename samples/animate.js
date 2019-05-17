
var Matrix = require('rpi-matrix');
var GifAnimation = require('../src/gif-animation.js');


function getMatrixConfiguration() {


	function convertMatrixConfiguration(config) {

		var options = {...config};

		function toInt(name) {
			if (options[name] != undefined) {
				options[name] = parseInt(options[name]);
			}
		}	
		
		toInt('led-rows');
		toInt('led-cols');

		return options;
	}

	var params = ['led-rows', 'led-cols'];
	var processOptions = {};

	params.forEach((param) => {
		var name = param;
		
		name = name.toUpperCase();
		name = name.replace('-', '_');

		if (value != undefined) {
			processOptions[param] = value;
		}
	});

	return convertMatrixConfiguration(processOptions);

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

			var config = argv;
			

		
			var config = {...getMatrixConfiguration(), ...argv};

			Matrix.configure(config);


			console.log('argv', argv);
			var sample = new GifAnimation(argv);
			sample.run();
		}
		catch (error) {
			console.error(error.stack);
		}

    }
    


};

new Command();



