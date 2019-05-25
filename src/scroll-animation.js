var path = require('path');

var Matrix = require('rpi-matrix');
var Animation = require('rpi-animations').Animation;
var AnimationQueue = require('rpi-animations').Queue;


module.exports = class ScrollAnimation extends Animation  {

    constructor(options) {

        super(options);

        var {scrollDelay = 10, scrollDirection = 'right', scrollImage = undefined} = options;

        this.matrix          = new Matrix({mode: 'canvas'});
        this.scrollDelay     = scrollDelay;
        this.scrollDirection = scrollDirection;
        this.scrollImage     = scrollImage;

        console.log(this);

    }

    loop() {
        return new Promise((resolve, reject) => {
            if (this.scrollImage == undefined) {
                throw new Error('scrollImage needed.')
            }
    
            Promise.resolve().then(() => {
                this.matrix.render(this.scrollImage.data, {scroll:this.scrollDirection, scrollDelay:this.scrollDelay});
                resolve();
            })
            .catch(error => {
                reject(error);
            });
    
        });


    }    

};



