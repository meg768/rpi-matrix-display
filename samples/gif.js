
var GifAnimation = require('../src/gif-animation.js');
var MatrixCommand = require('../src/matrix-command.js');


module.exports = class GifCommand extends MatrixCommand {

	constructor(options) {
		super({...options, command:'gif [options]', description:'Animate GIFs'});
	}

	options(args) {
		super.options(args);
		args.option('name', { describe: 'Specifies name of GIF'});
		args.option('duration', { describe: 'Animate for a specified time (ms)', default:30000});
		args.option('iterations', { describe: 'Number of iterations to animate'});
	}

	runAnimations() {

		var argv = {...this.argv, debug:this.debug};

		this.queue.enqueue(new GifAnimation(argv));

		if (this.argv.name == undefined) {
			this.queue.on('idle', () => {
				this.queue.enqueue(new GifAnimation(argv));
			});

			this.queue.enqueue(new GifAnimation(argv));
		}
	}

};

