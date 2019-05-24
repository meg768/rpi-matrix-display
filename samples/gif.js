
var Matrix = require('rpi-matrix');
var GifAnimation = require('../src/gif-animation.js');
var Animation = require('rpi-animations').Animation;
var AnimationQueue = require('rpi-animations').Queue;


class Command {

	constructor() {
		module.exports.command = 'gif [options]';
		module.exports.describe = 'Animate gifs';
		module.exports.builder = this.defineArgs;
		module.exports.handler = this.run;

	}

	defineArgs(args) {

		args.usage('Usage: $0 animate [options]');

		args.option('help', { describe: 'Displays this information' });
		args.option('name', { describe: 'Specifies name of GIF'});
		args.option('duration', { describe: 'Animate for a specified time (ms)' });
		args.option('iterations', { describe: 'Number of iterations to animate' });

		args.wrap(null);

		args.check(function (argv) {
			return true;
		});

		return args.argv;
	}


	run(argv) {

		try {
			Matrix.configure(argv);

			if (argv.name == undefined) {
				var queue = new AnimationQueue();

				queue.on('idle', () => {
					queue.enqueue(new GifAnimation(argv));
				});

				queue.enqueue(new GifAnimation(argv));
	
				queue.dequeue();
			}
			else {
				var sample = new GifAnimation(argv);
				sample.run();
	
			}

		}
		catch (error) {
			console.error(error.stack);
		}

	}



};

new Command();