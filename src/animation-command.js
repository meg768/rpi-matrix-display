
var Matrix = require('rpi-matrix');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class extends MatrixCommand {

    constructor(options) {
        super(options); 
    }


    options(args) {
        super.options(args);

		args.option('duration', { describe: 'Animate for a specified time (ms)', default:30000});
		args.option('iterations', { describe: 'Number of iterations to animate'});

    }
    


};






