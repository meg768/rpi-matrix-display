var root = '..';
var path = require('path');
var once = require('yow/once');
var sprintf = require('yow/sprintf');

var Matrix = require('rpi-matrix');
var ScrollAnimation = require('./scroll-animation.js');

var loadEmojis = once((folder) => {
    var fs = require('fs');
    var path = require('path');

    var images = [];

    fs.readdirSync(folder).forEach((file) => {

        var fileName = path.join(folder, file);
        var components = path.parse(fileName);

        if (components.ext == '.png') {
            images[components.name] = {fileName:fileName};
        }

    })

    return images;

});


module.exports = class TextAnimation extends ScrollAnimation  {

    constructor(options) {

        super({...options, name:'TextAnimation'});

        var {text = 'ABC 123', fontSize = 0.65, emojiSize = 0.75, fontStyle = 'bold', fontName = 'Arial', textColor = 'auto'} = options;

        if (textColor == 'auto') {
            var now = new Date();
            var hue = Math.floor(360 * (((now.getHours() % 12) * 60) + now.getMinutes()) / (12 * 60));
    
            textColor = sprintf('hsl(%d,100%%,50%%)', hue);    
        }

        this.text       = text;
        this.fontSize   = fontSize;
        this.emojiSize  = emojiSize;
        this.fontStyle  = fontStyle;
        this.fontName   = fontName;
        this.textColor  = textColor;

        this.colors     = require('color-name');
        this.emojis     = loadEmojis(path.join(__dirname, '../emojis'));



    }


    createTextImage(text) {
        
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

    createEmojiImage(image) {
        var margin = this.matrix.height * (1 - this.emojiSize);
        var scale = (this.matrix.height - margin) / image.height;  

        var imageWidth = image.width * scale;
        var imageHeight = image.height * scale;

        var canvas = Matrix.Canvas.createCanvas(imageWidth, imageHeight);
        var ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0, imageWidth, imageHeight);  
        
        return ctx.getImageData(0, 0, canvas.width, canvas.height);    

    }

    prepare(item) {
        var util = require('util');

        return new Promise((resolve, reject) => {

            try {
                if (item.type == 'emoji') {
                    if (item.fileName != undefined) {
                        Matrix.Canvas.loadImage(item.fileName).then((image) => {
                            item.image = this.createEmojiImage(image);    
                        })
                        .then(() => {
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        });
            
                    }
                    else
                        throw new Error('No image for emoji!');
                }
                else if (item.type == 'text') {
                    if (item.text.length > 0)
                       item.image = this.createTextImage(item.text);

                    resolve();
                }
                else if (item.type == 'color') {
                    var ctx = this.matrix.canvas.getContext('2d');
                    ctx.fillStyle = util.format('rgb(%d,%d,%d)', item.color[0], item.color[1], item.color[2]);
                    resolve();
                }
                else {
                    throw new Error('Invalid item: ' + JSON.stringify(item));
                }
    
            }
            catch(error) {
                reject(error);
            }
        });
    }

    parse(text) {

        return new Promise((resolve, reject) => {
            var output = [];
            var regexp = new RegExp(/(\:[\w\-\+]+\:|\{[\w\-\+]+\})/g);
            var emojiRegExp = new RegExp(/(\:[\w\-\+]+\:)/g);
            var colorRegExp = new RegExp(/(\{[\w\-\+]+\})/g);

            text.split(regexp).forEach((text) => {
    
                if (text.match(emojiRegExp)) {
                    var name  = text.replace(/:/g, '');
                    var emoji = this.emojis[name];
    
                    if (emoji != undefined) {
                        output.push({type:'emoji', name:name, fileName:emoji.fileName});
                    }
                    else
                        output.push({type:'text', text:text});
                }
                else if (text.match(colorRegExp)) {
                    var name  = text.replace('{', '').replace('}', '');    
                    var color = this.colors[name];
    
                    if (color != undefined) {
                        output.push({type:'color', name:name, color:color});
                    }
                    else
                        output.push({type:'text', text:text});
                }
                else {
                    output.push({type:'text', text:text});
                }
            });
    
            var promise = Promise.resolve();

            output.forEach((item) => {
                promise = promise.then(() => {
                    return this.prepare(item);
                })
            })

            promise.then(() => {
                resolve(output);
            })
            .catch(error => {
                reject(error);
            });
 
            
        });
    }

    createDisplayImage(items) {

        var totalWidth = 0;
        var offset = 0;

        items.forEach((item) => {
            if (item.image != undefined)
                totalWidth += item.image.width;
        });

        var canvas = Matrix.Canvas.createCanvas(totalWidth + this.matrix.width, this.matrix.height);
        var ctx = canvas.getContext('2d');

        items.forEach((item) => {
            if (item.image != undefined) {
                ctx.putImageData(item.image, offset, (this.matrix.height - item.image.height) / 2);
                offset += item.image.width;    
            }
        });

        return ctx.getImageData(0, 0, canvas.width, canvas.height);

    }

    start() {

        var ctx = this.matrix.canvas.getContext('2d');
        ctx.font = this.fontStyle + ' ' + (this.matrix.height * this.fontSize) + 'px ' + this.fontName;
        ctx.fillStyle = this.textColor;

        return new Promise((resolve, reject) => {
            this.parse(this.text).then((context) => {
                this.scrollImage = this.createDisplayImage(context);
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



