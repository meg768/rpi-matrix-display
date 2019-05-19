var path = require('path');
var once = require('yow/once');
//var Request = require('./request.js');
var Request = require('yow/request');

var TextAnimation = require('./text-animation.js');
var Animation = require('./animation.js');
var AnimationQueue = require('./animation-queue.js');

var debug = console.log;


module.exports = class NewsAnimation extends TextAnimation  {

    constructor(options) {

        var {category = 'business', country = 'se', ...other} = options;

        super(other);

        this.apiKey = process.env.NEWS_API_KEY;

        if (!this.apiKey)
            throw new Error('Need API key');

        var headers = {};
        headers['Content-Type'] = 'application/json';
        headers['x-api-key'] = this.apiKey;
        

        this.gopher = new Request('https://newsapi.org', {headers:headers});
        this.country = country;
        this.category = category;
    }

    fetchNews() {
        return new Promise((resolve, reject) => {

            var query = {};
            query.country  = this.country;
            query.category = this.category;
            query.pageSize = 1;

            this.gopher.get('/v2/top-headlines', {query:query}).then((response) => {

                var articles = response.body.articles.slice(0, 1);

                articles.forEach(article => {
                    console.log(article.title);
                });

                resolve(articles[0]);
            })
            .catch((error) => {
                reject(error);
            })
        });

    }

    start() {


        return new Promise((resolve, reject) => {
            this.fetchNews().then((article) => {
                this.text = ':money-bag:' + article.title;
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



