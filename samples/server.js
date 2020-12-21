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

        var paths = [
            {name: '/text',    animation:require('../src/text-animation.js')},
            {name: '/rain',    animation:require('../src/rain-animation.js')},
            {name: '/weather', animation:require('../src/weather-animation.js')},
            {name: '/news',    animation:require('../src/news-animation.js')},
            {name: '/gif',     animation:require('../src/gif-animation.js')}
        ];

        paths.forEach((path) => {
            app.post(path.name, (request, response) => {
                try {
                    this.queue.enqueue(new path.animation({...request.query, ...request.body}));
                    response.status(200).json({ status:'OK'});    
                }
                catch(error) {
                    response.status(401).json({status:error.message});    
    
                }
    
            });           
        });
        /*
        app.post('/text', (request, response) => {
            var Animation = require('../src/text-animation.js');
            this.queue.enqueue(new Animation({...request.query, ...request.body}));
            response.status(200).json({ status:'OK'});
        });

        app.post('/news', (request, response) => {
            var Animation = require('../src/news-animation.js');
            this.queue.enqueue(new Animation({...request.query, ...request.body}));
            response.status(200).json({ status:'OK'});
        });

        app.post('/rain', (request, response) => {
            var Animation = require('../src/rain-animation.js');
            this.queue.enqueue(new Animation({...request.query, ...request.body}));
            response.status(200).json({ status:'OK'});
        });

        app.post('/gif', (request, response) => {
            try {
                var Animation = require('../src/gif-animation.js');
                this.queue.enqueue(new Animation({...request.query, ...request.body}));
                response.status(200).json({ status:'OK'});    
            }
            catch(error) {
                response.status(401).json({status:error.message});    

            }
        });
        */

        app.listen(this.argv.port);

    }


	runAnimations() {
        this.setupExpress();

        this.queue.on('idle', () => {
        });

	}

};



