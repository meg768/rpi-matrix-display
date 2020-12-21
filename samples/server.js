var MatrixCommand = require('../src/matrix-command.js');

module.exports = class extends MatrixCommand {

    constructor(options) {
        super({command: 'server [options]', description: 'Run matrix server', ...options}); 
    }

    options(args) {
        super.options(args);
        args.option('port', {describe:'Port', default:4000});
    }

    setupExpress() {
        var express = require('express');
        var app = express();
        var bodyParser = require('body-parser');

        app.use(bodyParser.urlencoded({ limit: '50mb', extended: false}));
        app.use(bodyParser.json({limit: '50mb'}));

        app.get('/text', (request, response) => {
            this.debug('body:', request.body);
            this.debug('query:', request.query);

            var Animation = require('../src/text-animation.js');
            var options = Object.assign({}, request.body, request.query);

            this.queue.enqueue(new Animation(options));
            response.status(200).json({ status:'OK'});
        });

        app.listen(this.argv.port);

    }


	runAnimations() {
        this.setupExpress();

        this.queue.on('idle', () => {
        });

	}

};



