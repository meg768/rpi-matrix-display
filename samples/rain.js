
var RainAnimation = require('../src/rain-animation.js');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class RainCommand extends MatrixCommand {

    constructor(options) {
		super({command: 'rain [options]', description:'Fill matrix with rain', ...options});
    }

    options(args) {
		super.options(args);
		args.option('duration', {describe:'Animation duration in milliseconds', default:-1});
	}

	runAnimations() {
		var animation = new RainAnimation({...this.argv, debug:this.debug});		
		return animation.run();
	}


};





