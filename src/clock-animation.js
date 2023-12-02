var Matrix    = require('../../../matrix.js');
var Color = Matrix.Color;
var Animation = require('./animation.js');
var AnimationQueue = require('./animation-queue.js').Queue;

var fs = require('fs');

var _layers = undefined;

var debug = function() {
    console.log.apply(this, arguments);
}


module.exports = class ClockAnimation extends Animation {

    constructor(matrix, options) {
        super(options);

        this.matrix = matrix;
        this.hue    = undefined;
        this.psd    = undefined;
        this.layers = undefined;


        if (options.color != undefined) {
            try {
                this.hue = Color(options.color).hsl().color[0];
            }
            catch(error) {    
            }
        }

    }

    getLayer(psd, name) {

        var psdWidth = psd.header.rows; 
        var psdHeight = psd.header.cols; 

        return new Promise((resolve, reject) => {
            var layer = psd.tree().childrenAtPath(name)[0];
            var image = layer.get('image');
            var fileName = '/tmp/_tmpImage.png';

            var canvas = this.matrix.createCanvas(psdWidth, psdHeight);
            var ctx = canvas.getContext('2d');
            
            image.saveAsPng(fileName).then(() => {
                return Promise.resolve();
            })
            .then(() => {
                return this.matrix.loadImage(fileName);
            })
            .then((image) => {
                fs.unlinkSync(fileName);

                ctx.drawImage(image, layer.left, layer.top, layer.width, layer.height);
                resolve(canvas);
            })
            .catch(error => {
                reject(error);
            });
  
        });
    }

    
    getLayers(psd) {

        return new Promise((resolve, reject) => {
            var layersNames = ['background', 'hours', 'minutes', 'seconds'];
            var promise = Promise.resolve();
            var layers = {};

            layersNames.forEach((layerName) => {
                promise = promise.then(() => {
                    return this.getLayer(psd, layerName);
                })
                .then((canvas) => {
                    layers[layerName] = canvas;
                });
            });

            promise.then(() => {
                resolve(layers);
            })
            .catch(error => {
                reject(error);
            })
        });
    }


    start() {

        return new Promise((resolve, reject) => {

            this.psd    = null;
            this.layers = null;

            super.start().then(() => {
                debug('Loading PSD library...');
                var PSD = require('psd');
                var fileName = __filename.replace('.js', '.psd');
                debug('Loading clock', fileName);
                
                debug('Parsing PSD file...');
                this.psd = PSD.fromFile(fileName);
                this.psd.parse();

                return this.getLayers(this.psd)
    
            })
            .then((layers) => {
                this.layers = layers;
            })
            .then(() => {
                debug('Done.');
                resolve();
            })
            .catch(error => {
                reject(error);
            });

    
        });
    }

    stop() {
        return new Promise((resolve, reject) => {

            super.stop().then(() => {
                var ctx = this.matrix.canvas.getContext('2d');
                ctx.clearRect(0, 0, this.matrix.width, this.matrix.height);
                this.matrix.render({blend:50});
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


        var psdWidth = this.psd.header.rows; 
        var psdHeight = this.psd.header.cols; 

        var date = new Date();

        var hour   = (date.getHours() + date.getMinutes() / 60) / 12;
        var minute = date.getMinutes() / 60; 
        var second = date.getSeconds() / 60;
        var hue    = 360 * ((date.getHours() * 60 * 60) + (date.getMinutes() * 60) + date.getSeconds()) / (60 * 60 * 12);

        if (this.hue)
            hue = this.hue;

        var canvas = this.matrix.createCanvas(psdWidth, psdHeight);
        var ctx = canvas.getContext('2d');

        ctx.drawImage(this.layers['background'], 0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(hour * 2 * Math.PI);
        ctx.drawImage(this.layers['hours'], -canvas.width/2, -canvas.height/2);
        ctx.restore();

        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(minute * 2 * Math.PI);
        ctx.drawImage(this.layers['minutes'], -canvas.width/2, -canvas.height/2);
        ctx.restore();

        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(second * 2 * Math.PI);
        ctx.drawImage(this.layers['seconds'], -canvas.width/2, -canvas.height/2);
        ctx.restore();

        ctx = this.matrix.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.matrix.width, this.matrix.height);
        ctx.drawImage(canvas, 0, 0, this.matrix.width, this.matrix.height);

        // Colorize
        var image = ctx.getImageData(0, 0, this.matrix.width, this.matrix.height);

        for (var i = 0, length = image.data.length; i < length; i += 4) {
            var color;

            color = Matrix.Color.rgb(image.data[i + 0], image.data[i + 1], image.data[i + 2]).hsl();
            color = Matrix.Color.hsl(hue, color.color[1], color.color[2]).rgb().array();

            image.data[i + 0] = color[0];
            image.data[i + 1] = color[1];
            image.data[i + 2] = color[2];
        }

        ctx.putImageData(image, 0, 0);

        this.matrix.render();
    
    }

};


