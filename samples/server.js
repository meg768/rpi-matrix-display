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

        app.post('/text', (request, response) => {
            this.debug(request);
            
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



