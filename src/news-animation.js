var path = require('path');
var once = require('yow/once');

var TextAnimation = require('./text-animation.js');


module.exports = class NewsAnimation extends TextAnimation  {

    constructor(options) {

        super(options);


    }

    run() {
        return new Promise((resolve, reject) => {

            console.log('News!');
            resolve();
        });

    }


/*    start() {


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
    */

};



