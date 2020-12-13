
var Matrix = require('rpi-matrix');
var GifAnimation = require('../src/gif-animation.js');
var Animation = require('rpi-animations').Animation;
var AnimationQueue = require('rpi-animations').Queue;
var Command = require('../src/command.js');


module.exports = class GifCommand extends Command {

	constructor() {
		super({command:'gif [options]', description:'Animate GIFs'});
	}

	options(args) {
		super.options(args);
		args.option('name', { describe: 'Specifies name of GIF'});
		args.option('duration', { describe: 'Animate for a specified time (ms)', default:30000});
		args.option('iterations', { describe: 'Number of iterations to animate' });
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

