
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Request = require('yow/request');
var debug = console.log;

class Command {

    constructor() {
        module.exports.command  = 'news [options]';
        module.exports.describe = 'Display news';
        module.exports.builder  = this.defineArgs;
        module.exports.handler  = this.run;
        
    }

    defineArgs(args) {

        args.usage('Usage: $0 [options]');

        args.option('help', {describe:'Displays this information'});
        args.option('textColor', {describe:'Specifies text color', alias:['color'], default:'red'});
        args.option('category', {describe:'News category', choices:['entertainment', 'general', 'health', 'science', 'sports', 'technology']});
        args.option('source', {describe:'News source'});
        args.option('language', {describe:'News language', default:'se'});
        args.option('apiKey', {describe:'API key for newsapi.org', default:process.env.NEWS_API_KEY});
        args.option('search', {describe:'Search keyword', default:undefined});

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }


	run(argv) {

        debug(argv);

        Matrix.configure(argv);
        var queue = new AnimationQueue();


        function enqueueNews()  {
            return new Promise((resolve, reject) => {

                var headers = {};
                headers['Content-Type'] = 'application/json';

                var request = new Request('https://newsapi.org', {debug:debug, headers:headers});

                var query = {pageSize:3};

                var {language, country, category, sources, search, apiKey} = argv;

                if (language != undefined)
                    query.language = language;

                if (country != undefined)
                    query.country = country;

                if (search!= undefined)
                    query.search = search;

                if (sources != undefined)
                    query.sources = sources;

                if (apiKey != undefined)
                    query.apiKey = apiKey;

                if (category != undefined)
                    query.category = category;

                request.get('/v2/top-headlines', {query:query}).then((response) => {

                    var articles = response.body.articles;

                    articles.forEach(article => {
                        debug(article.title);
                        queue.enqueue(new TextAnimation({...argv, text:article.title}));
                    });

                    resolve();
                })
                .catch((error) => {
                    reject(error);
                })
            });
        }



        queue.on('idle', () => {
            enqueueNews().then(() => {
                debug('More news fetched.');
            })
            .catch((error) => {
                console.error(error);
            });
        });

        enqueueNews().then(() => {
            debug('News fetched.');
            queue.dequeue();
        })
        .catch((error) => {
            console.error(error);
        });



	}
    


};

new Command();



