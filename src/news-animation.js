var path = require('path');
var once = require('yow/once');
//var Request = require('./request.js');
var Request = require('yow/request');

var TextAnimation = require('./text-animation.js');

var debug = console.log;


module.exports = class NewsAnimation extends TextAnimation  {

    constructor(options) {

        super(options);

        this.apiKey = process.env.NEWS_API_KEY;

        if (!this.apiKey)
            throw new Error('Need API key');

        var headers = {};
        headers['Content-Type'] = 'application/json';
        headers['x-api-key'] = this.apiKey;
        
        this.gopher = new Request('https://newsapi.org', {debug:debug, headers:headers});
    }

    fetchNews() {
        return new Promise((resolve, reject) => {

            var query = {};
            query.country  = 'se';
            query.category = 'business';

            this.gopher.get('/v2/top-headlines', {query:query}).then((response) => {

                var articles = response.body.articles.slice(0, 5);

                articles.forEach(article => {
                    console.log(article.title);
                });

                resolve(articles);
            })
            .catch((error) => {
                reject(error);
            })
        });

    }

    start() {


        return new Promise((resolve, reject) => {
            this.fetchNews().then((articles) => {
                this.text = ':money-bag:' + articles[0].title;
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



