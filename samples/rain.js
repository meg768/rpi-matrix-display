
var RainAnimation = require('../src/rain-animation.js');
var AnimationCommand = require('../src/animation-command.js');

module.exports = class RainCommand extends AnimationCommand {

    constructor(options) {
		super({command: 'rain [options]', description:'Fill matrix with rain', ...options});
    }

    options(args) {
		super.options(args);
	}

	runAnimations() {
		var animation = new RainAnimation({...this.argv, debug:this.debug});		
		return animation.run();
	}


};





