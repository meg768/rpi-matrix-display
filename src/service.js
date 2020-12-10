
var Matrix = require('rpi-matrix');
var AnimationQueue = require('rpi-animations').Queue;



module.exports = class Service {

    constructor(options) {
        var {queue, argv} = options;
        this.debug = console.log;
        this.argv  = argv;
        this.queue = queue;

        if (this.argv == undefined)
            this.debug = () => {};
    }

    run() {
    }
    


};


