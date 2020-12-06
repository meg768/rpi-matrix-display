
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Animation = require('rpi-animations').Animation;
var Request = require('yow/request');
var sprintf = require('yow/sprintf');
var NewsFeed = require('../src/news-feed.js');

var debug = console.log;

/*
class NewsAnimation extends Animation {

    constructor(options) {
        super(options);

        this.news = [];
    }

    start() {

        return new Promise((resolve, reject) => {
            var newsfeed = new NewsFeed();

            newsfeed.fetch().then((news) => {
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
*/

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
        args.option('debug', {describe:'Debug mode', default:true});

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }


	run(argv) {

        var news = new NewsFeed(argv);

        news.fetch((news) => {
            console.log(news);

        })
        .catch((error) => {
            console.error(error);
        });



	}
    


};

new Command();



