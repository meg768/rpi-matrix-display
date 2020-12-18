
var RainAnimation = require('../src/rain-animation.js');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class RainCommand extends MatrixCommand {

    constructor(options) {
		super({command: 'rain [options]', description:'Fill matrix with rain', ...options});
    }

    options(args) {
		super.options(args);
		args.option('duration',   {describe: 'Animate for a specified time (ms)', default:30000});
		args.option('iterations', {describe: 'Number of iterations to animate'});

	}

	runAnimations() {
		var animation = new RainAnimation({...this.argv, debug:this.debug});		
		return animation.run();
	}


};





