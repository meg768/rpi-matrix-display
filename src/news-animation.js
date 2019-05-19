var path = require('path');
var once = require('yow/once');
var Request = require('yow/request');

var TextAnimation = require('./text-animation.js');

var debug = console.log;


module.exports = class NewsAnimation extends TextAnimation  {

    constructor(options) {

        super(options);

        this.apiKey = process.env.NEWS_API_KEY;

        if (!this.apiKey)
            throw new Error('Need API key');
    }

    fetchNews() {
        return new Promise((resolve, reject) => {

            var gopher = new Request('https://newsapi.org/v2');

            var query = {};
            query.country  = 'se';
            query.category = 'business';
            query.apiKey   = this.apiKey;

            gopher.get('headlines', {query:query}).then((response) => {
                console.log()
                debug(response);
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
        });

    }
    run() {
        debug('Running');
        return this.fetchNews();
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



