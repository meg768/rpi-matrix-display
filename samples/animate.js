
var Matrix = require('rpi-matrix');
var GifAnimation = require('../src/gif-animation.js');

var path = require('path');
var fs = require('fs');

function debug() {

}

class Sample extends Matrix {


	constructor(options) {
		super({...options, ...{mode:'canvas'}});

		this.options = options;
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
            fileName = path.join(__dirname, '../gifs/96x96', name + '.gif');
 
        if (!fileExists(fileName))
            fileName = path.join(__dirname, '../gifs/32x32', name + '.gif');

 
        return fs.readFileSync(fileName);    
    }


    run() {
        var GIF = require('omggif');
        var gif = new GIF.GifReader(this.loadGIF(this.options.gif));
        var ctx = this.canvas.getContext('2d');
        var numFrames = gif.numFrames();

        var canvas = this.createCanvas(gif.width, gif.height);

        var scaleX = this.width  / gif.width;
        var scaleY = this.height / gif.height;

        ctx.scale(scaleX, scaleY);

        if (scaleX > 1 || scaleY > 1)
            ctx.imageSmoothingEnabled = false;

        for (;;) {
            for (var i = 0; i < numFrames; i++) {
                var frame = gif.frameInfo(i);
                var image = ctx.createImageData(gif.width, gif.height);
                gif.decodeAndBlitFrameRGBA(i, image.data);
    
                canvas.getContext("2d").putImageData(image, 0, 0);
                ctx.drawImage(canvas, 0, 0);
    
                this.render();
                this.sleep(frame.delay * 10);
    
            }
    
        }

    }
};


class Command {

    constructor() {
        module.exports.command  = 'animate [options]';
        module.exports.describe = 'Animate gifs';
        module.exports.builder  = this.defineArgs;
        module.exports.handler  = this.run;
        
    }

    defineArgs(args) {

		args.usage('Usage: $0 animate [options]');

		args.option('help', {describe:'Displays this information'});
		args.option('gif',  {describe:'Specifies name of GIF', default:'pacman'});
		args.option('duration', {describe:'Animate for a specified time (ms)'});

		args.wrap(null);

		args.check(function(argv) {
			return true;
		});

		return args.argv;
	}


	run(argv) {

		try {

            Matrix.configure(argv);
			var sample = new GifAnimation(argv);
			sample.run();
		}
		catch (error) {
			console.error(error.stack);
		}

    }
    


};

new Command();



