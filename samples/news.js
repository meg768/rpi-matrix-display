
var Matrix = require('rpi-matrix');
var TextAnimation = require('../src/text-animation.js');
var AnimationQueue = require('rpi-animations').Queue;
var Animation = require('rpi-animations').Animation;
var Request = require('yow/request');
var Timer = require('yow/timer');
var sprintf = require('yow/sprintf');
var NewsFeed = require('../src/news-feed.js');

var debug = console.log;


class Command {

    constructor() {
        module.exports.command  = 'news [options]';
        module.exports.describe = 'Display news';
        module.exports.builder  = this.defineArgs.bind(this);
        module.exports.handler  = this.run.bind(this);
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
    
    displayNews() {
        return new Promise((resolve, reject) => {
            var feed = new NewsFeed();

            feed.fetch().then((news) => {
  
                news.forEach((item) => {
                    var text = sprintf('%s - %s', item.description, item.text);
                    this.queue.enqueue(new TextAnimation({text:text, textColor:'red'}));
                });
  
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    
        });
    }

    run(argv) {
        try {
            this.argv  = argv;
            this.queue = new AnimationQueue();
            this.timer = new Timer();
    
            Matrix.configure(argv);
    
            this.queue.on('idle', () => {
                timer.setTimer(1 * 60 * 1000, this.displayNews);
            });
        

            this.displayNews().then(() => {
                return this.queue.dequeue();
            })
            .then(() => {
                console.log('Done!')
            })
            .catch(error => {
                console.error(error.stack);
            })
        }
        catch (error) {
            console.error(error);
        }

    }
    


};

new Command();



