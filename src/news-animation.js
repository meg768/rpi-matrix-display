var Request = require('yow/request');
var TextAnimation = require('./text-animation.js');

var debug = console.log;


module.exports = class NewsAnimation extends TextAnimation  {

    constructor(options) {

        var {source = undefined, search = undefined, category = undefined, language = 'se', country = undefined, ...other} = options;

        super(other);

        this.apiKey   = process.env.NEWS_API_KEY;
        this.country  = country;
        this.category = category;
        this.search   = search;
        this.language = language;

        if (!this.apiKey)
            throw new Error('Need API key');

    }

    fetchNews() {
        return new Promise((resolve, reject) => {

            var headers = {};
            headers['Content-Type'] = 'application/json';
            headers['x-api-key'] = this.apiKey;

            var request = new Request('https://newsapi.org', {debug:debug, headers:headers});

            var query = {pageSize:3};

            if (this.category != undefined)
                query.category = this.category;

            if (this.country != undefined)
                query.country = this.country;

            if (this.language != undefined)
                query.language = this.language;

            request.get('/v2/top-headlines', {query:query}).then((response) => {

                var articles = response.body.articles;//.slice(0, 1);

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
                this.text = article.title;
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



