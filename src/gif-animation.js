var Matrix = require('rpi-matrix');
var Animation = require('./animation.js');
var random = require('yow/random');
var path = require('path');
var fs = require('fs');

class GifFrames {

    constructor(fileName) {
      
        var GIF = require('omggif');

        this.gif          = new GIF.GifReader(this.loadGIF(fileName));
        this.canvas       = Matrix.Canvas.createCanvas(this.gif.width, this.gif.height);
        this.frameCount   = this.gif.numFrames();
        this.currentFrame = 0;
        this.width        = this.gif.width;
        this.height       = this.gif.height;
    }


    loadGIF(name) {

        function fileExists(path) {

            try {
                fs.accessSync(path);		
                return true;
            }
            catch (error) {
            }
        
            return false;		
        }

        var fileName = '';

        if (!fileExists(fileName))
            fileName = path.join(__dirname, '../../gifs/96x96', name + '.gif');
 
        if (!fileExists(fileName))
            fileName = path.join(__dirname, '../../gifs/32x32', name + '.gif');

 
        return fs.readFileSync(fileName);    
    }


    nextFrame() {
        this.currentFrame++;

        if (this.currentFrame >= this.frameCount)
            this.currentFrame = 0;
    }

    isLastFrame() {
        this.currentFrame == this.frameCount - 1
    }

    getCurrentFrameDelay() {
        var frame = this.gif.frameInfo(this.currentFrame);
        return frame.delay;
    }

    drawCurrentFrame() {
        var image = this.canvas.getContext('2d').createImageData(this.gif.width, this.gif.height);
        this.gif.decodeAndBlitFrameRGBA(this.currentFrame, image.data);

        this.canvas.getContext("2d").putImageData(image, 0, 0);    
    }
    
}

module.exports = class GifAnimation extends Animation {

    constructor(options) {

        var {gif = 'pacman', iterations = undefined, ...other} = options;

        super(other);

        this.matrix     = new Matrix({mode:'canvas'});
        this.fileName   = gif;
        this.iterations = iterations;
    }


    stop() {
        return new Promise((resolve, reject) => {

            super.stop().then(() => {
                this.gif = null;
            })
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject(error);
            })

        });
    }    

    start() {
        return new Promise((resolve, reject) => {

            super.start().then(() => {
                var gif = new GifFrames(this.fileName);

                var ctx    = this.matrix.canvas.getContext('2d');
                var scaleX = this.matrix.width  / gif.width;
                var scaleY = this.matrix.height / gif.height;
        
                ctx.scale(scaleX, scaleY);
        
                if (scaleX > 1 || scaleY > 1)
                    ctx.imageSmoothingEnabled = false;
        
                this.gif = gif;

            })
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject(error);
            })

        });
    }  

    render() {

        if (this.iterations != undefined && this.iterations <= 0) {
            this.cancel();            
        }
        else {
            this.gif.drawCurrentFrame();
            this.matrix.canvas.getContext("2d").drawImage(this.gif.canvas, 0, 0);
    
            this.matrix.render();
            this.matrix.sleep(this.gif.getCurrentFrameDelay() * 10);
    
            this.gif.nextFrame();
    
            if (this.gif.currentFrame == 0) {
                if (this.iterations != undefined && this.iterations > 0) 
                    this.iterations--;
            }    
        }
    }

}

