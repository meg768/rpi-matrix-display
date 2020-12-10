
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;



module.exports = class Service {

    constructor(options) {
        var {queue} = options;
        this.debug = console.log;
        this.queue = queue;
    }

 
    run() {
    }
    


};


