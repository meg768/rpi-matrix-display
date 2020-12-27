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
        var bodyParser = require('body-parser');
        var app = express();

        app.use(bodyParser.urlencoded({ limit: '50mb', extended: false}));
        app.use(bodyParser.json({limit: '50mb'}));

		for (var name in this.animations) {
            app.post(`/{$name}`, (request, response) => {
                try {
					this.runAnimation(name, {...request.query, ...request.body});
                    response.status(200).json({status:'OK'});    
                }
                catch(error) {
                    response.status(401).json({status:error.message});    
    
                }
    
            });           

		}

        app.listen(this.argv.port);

	}
	
	runAnimation(name, options) {
        var Animation = this.animations[name];
        this.queue.enqueue(new Animation(options));
	}


	runAnimations() {

        this.animations = {
			'text'    : require('../src/text-animation.js'),
			'rain'    : require('../src/rain-animation.js'),
			'weather' : require('../src/weather-animation.js'),
			'news'    : require('../src/news-animation.js'),
			'gif'     : require('../src/gif-animation.js')
		};

		this.defaultAnimation = {
			name: 'text',
			options: {
				text: 'Default animation',
				iterations: 1,
			}
		};

        this.setupExpress();
		this.runAnimation('text', {text:':smiley:', iterations:1});

        this.queue.on('idle', () => {
        });

	}

};



