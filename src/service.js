
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;

var queue = new AnimationQueue();

class Service {

    constructor(options) {
        this.debug = console.log;
        this.queue = queue;
    }

 
    run() {
    }
    


};


