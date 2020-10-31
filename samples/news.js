
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Request = require('yow/request');
var sprintf = require('yow/sprintf');

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
        args.option('textColor', {describe:'Specifies text color', alias:['color'], default:'auto'});
        args.option('category', {describe:'News category', choices:['entertainment', 'general', 'health', 'science', 'sports', 'technology']});
        args.option('source', {describe:'News source'});
        args.option('language', {describe:'News language', default:'se'});
        args.option('apiKey', {describe:'API key for newsapi.org', default:process.env.NEWS_API_KEY});
        args.option('search', {describe:'Search keyword', default:undefined});
        args.option('pause', {describe:'Pause between news flashes in minutes', default:1});

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


        function fetchNews()  {
            return new Promise((resolve, reject) => {

                var headers = {};
                headers['Content-Type'] = 'application/json';

                var request = new Request('https://newsapi.org', {debug:debug, headers:headers});

                var query = {pageSize:3};

                var {language, country, category, sources, apiKey} = argv;

                if (language != undefined)
                    query.language = language;

                if (country != undefined)
                    query.country = country;

                if (sources != undefined)
                    query.sources = sources;

                if (apiKey != undefined)
                    query.apiKey = apiKey;

                if (category != undefined)
                    query.category = category;

                request.get('/v2/top-headlines', {query:query}).then((response) => {
                    resolve(response.body.articles);
                })
                .catch((error) => {
                    reject(error);
                })
            });
        }

        function enqueueNews()  {
            return new Promise((resolve, reject) => {

                fetchNews().then((articles) => {
                    var now = new Date();
                    var hue = Math.floor(360 * (((now.getHours() % 12) * 60) + now.getMinutes()) / (12 * 60));
                    var textColor = argv.textColor == 'auto' ? sprintf('hsl(%d,100%%,50%%)', hue) : argv.textColor;
                    var text = sprintf('%s - %s', article.title, article.source.name);

                    articles.forEach(article => {
                        queue.enqueue(new TextAnimation({...argv, textColor:textColor, text:text}));
                    });

                    resolve(articles);

                })
    
                .catch((error) => {
                    reject(error);
                })
            });
        }


        function delay(ms) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, ms);
            });

        }

        function fetch() {
            enqueueNews().then((articles) => {
                debug(articles);
            })
            .catch((error) => {
                console.error(error);
            });

        }

        queue.on('idle', () => {
            delay(argv.pause * 60000).then(() => {
                fetch();
            });
        });

        fetch();

	}
    


};

new Command();



