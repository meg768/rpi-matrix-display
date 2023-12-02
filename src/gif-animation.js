var Matrix = require('rpi-matrix');
var random = require('yow/random');
var once = require('yow/once');
var fs = require('fs');

var Animation = require('./animation.js');


var loadGifFiles = once((width, height) => {
    var path = require('path');
    var files = [];
    var folder = path.join(__dirname, '../gifs', width + 'x' + height);

    fs.readdirSync(folder).forEach((file) => {

        var fileName = path.join(folder, file);
        var components = path.parse(fileName);

        if (components.ext == '.gif') {
            files.push({name:components.name, fileName:fileName});  
        }

    });

    return files;

});



class GifFrames {

    constructor(fileName) {
      
        var fs = require('fs');
        var GIF = require('omggif');

        this.gif          = new GIF.GifReader(fs.readFileSync(fileName));
        this.canvas       = Matrix.Canvas.createCanvas(this.gif.width, this.gif.height);
        this.frameCount   = this.gif.numFrames();
        this.currentFrame = 0;
        this.width        = this.gif.width;
        this.height       = this.gif.height;
    }



    getFrameDelay(frame) {
        return this.gif.frameInfo(frame).delay;
    }

    drawFrame(frame) {
        var image = this.canvas.getContext('2d').createImageData(this.gif.width, this.gif.height);
        this.gif.decodeAndBlitFrameRGBA(frame, image.data);

        this.canvas.getContext("2d").putImageData(image, 0, 0);    
    }
    
}

module.exports = class GifAnimation extends Animation {

    constructor(options) {

        var {name = undefined, iterations = undefined, ...other} = options;

        super(other);

        this.matrix     = new Matrix({mode:'canvas'});
        this.name       = name;
        this.iterations = iterations;
        this.gifFiles   = loadGifFiles(this.matrix.width, this.matrix.height);

        console.log(`ITERATIONS ${iterations}`);
        if (this.gifFiles.length == 0) {
            throw new Error('No GIFs available for this size of matrix.');
        }

    }

    stop() {
        return new Promise((resolve, reject) => {

            super.stop().then(() => {
                console.log(`STOPPOING ANIMATIONS ANS CLANING UP`);

                let ctx = this.matrix.canvas.getContext("2d");
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, this.gif.width, this.gif.height);

                this.matrix.render({blend:50});
                console.log(`FINISHED`);
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
                var entry = this.gifFiles.find((item) => {
                    return item.name == this.name; 
                });

                if (entry == undefined) {
                    entry = random(this.gifFiles);
                }

                if (entry == undefined) {
                    throw new Error('GIF not found.')
                }

                var gif = new GifFrames(entry.fileName);

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

        if (!this.gif) {
            return;
        }

        if (this.gif.currentFrame < this.gif.frameCount) {
            console.log(`Drawing frame ${this.gif.currentFrame}`);
            
            this.gif.drawFrame(this.gif.currentFrame);
            this.matrix.canvas.getContext("2d").drawImage(this.gif.canvas, 0, 0);
    
            this.matrix.render();
            this.matrix.sleep(this.gif.getFrameDelay(this.gif.currentFrame) * 10);

            this.gif.currentFrame++;

        }
        else {
            console.log(`${this.iterations}`);
            if (this.iterations != undefined) {
                this.iterations--;

                if (this.iterations <= 0) {
                    this.cancel();            
                }
                else {
                    this.gif.currentFrame = 0;
                }
            } 
            else {
                this.cancel();
            }
    
        }
        
    }    


    renderX() {

        console.log(`CURRENT FRAME IS ${this.gif.currentFrame} ITERATIONS ${this.iterations}`);

        if (this.iterations != undefined && this.iterations <= 0) {
            this.cancel();            
        }
        else {
            this.gif.drawCurrentFrame();
            this.matrix.canvas.getContext("2d").drawImage(this.gif.canvas, 0, 0);
    
            this.matrix.render();
            this.matrix.sleep(this.gif.getCurrentFrameDelay() * 10);
    
            this.gif.nextFrame();
            console.log(`CURRENT FRAME IS ${this.gif.currentFrame}`);
    
            if (this.gif.currentFrame == 0) {
                console.log(`CURRENT FRAME IS 0`);
                console.log(`ITERATIONS ${this.gif.currentFrame}`);
                if (this.iterations != undefined && this.iterations > 0) 
                    this.iterations--;
            }    
        }
    }

}

