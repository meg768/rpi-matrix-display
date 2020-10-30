
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
        args.option('category', {describe:'News category', choices:['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']});
        args.option('source', {describe:'News source'});

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }


	run(argv) {

        Matrix.configure(argv);
        var queue = new AnimationQueue();


        function enqueueNews()  {
            return new Promise((resolve, reject) => {

                var headers = {};
                headers['Content-Type'] = 'application/json';
                headers['x-api-key'] = process.env.NEWS_API_KEY;

                var request = new Request('https://newsapi.org', {debug:debug, headers:headers});

                var query = {pageSize:3};

                query.language = 'se';

                request.get('/v2/top-headlines', {query:query}).then((response) => {

                    var articles = response.body.articles;//.slice(0, 1);

                    articles.forEach(article => {
                        console.log(article.title);
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
                console.log('More news fetched.');
            })
            .catch((error) => {
                console.error(error);
            });
        });

        enqueueNews().then(() => {
            console.log('News fetched.');
            queue.dequeue();
        })
        .catch((error) => {
            console.error(error);
        });



	}
    


};

new Command();



