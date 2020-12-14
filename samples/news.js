
var NewsService = require('../src/news-service.js');
var Timer = require('yow/timer');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class NewsCommand extends MatrixCommand {

    constructor(options) {
        super({...options, command:'news [options]', description:'Display news'});

        this.timer = new Timer();
    }

 
    options(args) {
        super.options(args);
    }

    getService() {
        return NewsService;
    }

    runNextService() {
        this.timer.setTimer(1000 * 60 * 1, () => {
            this.runService();
        });
    }


};



