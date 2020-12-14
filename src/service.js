
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;
var isFunction = require('yow/isFunction');


module.exports = class Service {

    constructor(options) {
        var {debug, queue} = options;

        this.debug = isFunction(debug) ? debug : (() => {});
        this.queue = queue;
    }

    run() {
    }
    


};


