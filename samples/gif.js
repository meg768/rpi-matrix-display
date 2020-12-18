
var GifAnimation = require('../src/gif-animation.js');
var AnimationCommand = require('../src/animation-command.js');


module.exports = class GifCommand extends AnimationCommand {

	constructor(options) {
		super({...options, command:'gif [options]', description:'Animate GIFs'});
	}

	options(args) {
		super.options(args);
		args.option('name', { describe: 'Specifies name of GIF'});
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

