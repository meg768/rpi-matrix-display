
var Matrix = require('rpi-matrix');
var RainAnimation = require('../src/rain-animation.js');
var Command = require('../src/command.js');

module.exports = class RainCommand extends Command {

    constructor() {
		super({command: 'rain [options]', description:'Fill matrix with rain'});
    }

    options(args) {
		super.options(args);
		args.option('duration', {describe:'Animation duration in milliseconds', default:-1});
	}


	run() {			
		Matrix.configure(this.argv);

		var animation = new RainAnimation({...this.argv, debug:this.debug});
		
		animation.run();
    }

};





