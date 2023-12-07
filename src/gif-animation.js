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

        var {name = undefined, ...other} = options;

        super(other);

        this.matrix     = new Matrix({mode:'canvas'});
        this.name       = name;
        this.gifFiles   = loadGifFiles(this.matrix.width, this.matrix.height);

        if (this.gifFiles.length == 0) {
            throw new Error('No GIFs available for this size of matrix.');
        }

    }

    async stop() {

        await super.stop();

        let ctx = this.matrix.canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.gif.width, this.gif.height);

        this.matrix.render({blend:50});
    }   

    async start() {
        await super.start();

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

        if (this.iterations != undefined) {
            this.iterations = this.iterations * this.gif.frameCount;
        }


    }  


    render() {

        if (this.gif.currentFrame < this.gif.frameCount) {
            this.gif.drawFrame(this.gif.currentFrame);
            this.matrix.canvas.getContext("2d").drawImage(this.gif.canvas, 0, 0);
    
            this.matrix.render();
            this.matrix.sleep(this.gif.getFrameDelay(this.gif.currentFrame) * 10);
    
            this.gif.currentFrame++;
    
        }
        else {
            if (this.iterations == undefined && this.duration >= 0) {
                this.cancel();
            }
            else {
                this.gif.currentFrame = 0;
            }

        }
    }    

}

