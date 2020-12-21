var path = require('path');
var once = require('yow/once');
var sprintf = require('yow/sprintf');

var Matrix = require('rpi-matrix');
var Animation = require('rpi-animations').Animation;

var loadEmojis = once((folder) => {
    var fs = require('fs');
    var path = require('path');

    var images = [];

    fs.readdirSync(folder).forEach((file) => {

        var fileName = path.join(folder, file);
        var components = path.parse(fileName);

        if (components.ext == '.png') {
            images[components.name] = fileName;
        }

    })

    return images;

});


module.exports = class TextAnimation extends Animation  {

    constructor(options) {
        var {text = 'ABC 123', fontSize = 0.65, emojiSize = 0.75, fontStyle = 'bold', fontName = 'Arial', textColor = 'auto', scrollDelay = 10, ...options} = options;

        super({...options, name:'TextAnimation'});

        if (textColor == 'auto') {
            var now = new Date();
            var hue = Math.floor(360 * (((now.getHours() % 12) * 60) + now.getMinutes()) / (12 * 60));
    
            textColor = sprintf('hsl(%d,100%%,50%%)', hue);    
        }

        this.text         = text;
        this.fontSize     = fontSize;
        this.emojiSize    = emojiSize;
        this.fontStyle    = fontStyle;
        this.fontName     = fontName;
        this.textColor    = textColor;
        this.scrollDelay  = scrollDelay;
        this.emojis       = loadEmojis(path.join(__dirname, '../emojis'));



    }


    parse(text) {

        return new Promise((resolve, reject) => {
            var regexp = new RegExp(/(\:[\w\-\+]+\:|\{[\w\-\+]+\})/g);
            var emojiRegExp = new RegExp(/(\:[\w\-\+]+\:)/g);
            var colorRegExp = new RegExp(/(\{[\w\-\+]+\})/g);

            var images = [];

            var generateTextImage = (text) => {
                var myctx = this.matrix.canvas.getContext('2d');
                var textSize = myctx.measureText(text); 
        
                var canvas = Matrix.Canvas.createCanvas(textSize.width, this.matrix.height);
        
                var ctx = canvas.getContext('2d');
                ctx.font = myctx.font;
                ctx.fillStyle = myctx.fillStyle;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
        
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
                return ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
        
            var generateEmojiImage = (image) => {
                var margin = this.matrix.height * (1 - this.emojiSize);
                var scale = (this.matrix.height - margin) / image.height;  
        
                var imageWidth = image.width * scale;
                var imageHeight = image.height * scale;
        
                var canvas = Matrix.Canvas.createCanvas(imageWidth, imageHeight);
                var ctx = canvas.getContext('2d');
        
                ctx.drawImage(image, 0, 0, imageWidth, imageHeight);  
                
                return ctx.getImageData(0, 0, canvas.width, canvas.height);    
        
            }

            var generateScrollImage = (images) => {

                var totalWidth = 0;
                var offset = 0;
        
                images.forEach((image) => {
                    totalWidth += image.width;
                });
        
                var canvas = Matrix.Canvas.createCanvas(totalWidth + this.matrix.width, this.matrix.height);
                var ctx = canvas.getContext('2d');
        
                images.forEach((image) => {
                    ctx.putImageData(image, offset, (this.matrix.height - image.height) / 2);
                    offset += image.width;    
                });
        
                return ctx.getImageData(0, 0, canvas.width, canvas.height);
        
            }
        
            var parseText = (text) => {

                if (text.length > 0)
                    images.push(generateTextImage(text));

                return Promise.resolve();
            }

            var parseEmoji = (text) => {
                var name  = text.replace(/:/g, '');
                var emoji = this.emojis[name];

                if (emoji == undefined)
                    return parseText(text);

                return new Promise((resolve, reject) => {
                    Matrix.Canvas.loadImage(emoji).then((image) => {
                        images.push(generateEmojiImage(image));
                        resolve();    
                    })
                    .catch(error => {
                        reject(error);
                    });
                });
            }   

            var parseColor = (text) => {
                var colorNames = require('color-name');
                var name  = text.replace('{', '').replace('}', '');    
                var color = colorNames[name];

                if (color == undefined)
                    return parseText(text);

                var ctx = this.matrix.canvas.getContext('2d');
                var util = require('util');

                ctx.fillStyle = util.format('rgb(%d,%d,%d)', color[0], color[1], color[2]);

                return Promise.resolve();
            }

            var promise = Promise.resolve();

            text.split(regexp).forEach((text) => {
    
                promise = promise.then(() => {
                    if (text.match(emojiRegExp)) {
                        return parseEmoji(text);
                    }
                    else if (text.match(colorRegExp)) {
                        return parseColor(text);
                    }
                    else {
                        return parseText(text);
                    }    
                });
            });
    
            promise.then(() => {
                resolve(generateScrollImage(images));
            })
            .catch(error => {
                reject(error);
            });
 
            
        });
    }


    getText() {
        return new Promise((resolve, reject) => {
            resolve(this.text);    
        });

    }
/*
    render() {

        if (this.iterations != undefined && this.iterations <= 0) {
            this.cancel();            
        }
        else {
            this.matrix.render(this.scrollImage.data, {scroll:'left', scrollDelay:10});

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
*/

    render() {
        this.matrix.render(this.scrollImage.data, {scroll:'left', scrollDelay:this.this.scrollDelay});
    }

    start() {

        var ctx = this.matrix.canvas.getContext('2d');
        ctx.font = this.fontStyle + ' ' + (this.matrix.height * this.fontSize) + 'px ' + this.fontName;
        ctx.fillStyle = this.textColor;

        return new Promise((resolve, reject) => {
            this.getText().then((text) => {
                return this.parse(text);
            })
            .then((image) => {
                this.scrollImage = image;
            })
            .then(() => {
                return super.start();
            })
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject(error);
            });
    
        });

    }    

};



