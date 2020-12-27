var MatrixCommand = require('../src/matrix-command.js');





module.exports = class extends MatrixCommand {

    constructor(options) {
		var TextAnimation    = require('../src/text-animation.js');
		var RainAnimation    = require('../src/rain-animation.js');
		var NewsAnimation    = require('../src/news-animation.js');
		var WeatherAnimation = require('../src/weather-animation.js');
		var GifAnimation     = require('../src/gif-animation.js');

		super({command: 'server [options]', description: 'Run matrix server', ...options}); 

		this.animations = {
			'text'    : TextAnimation,
			'rain'    : RainAnimation,
			'weather' : WeatherAnimation,
			'news'    : NewsAnimation,
			'gif'     : GifAnimation
		};

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
			console.log(`/${name}`);
            app.post(`/${name}`, (request, response) => {
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



		this.xdefaultAnimation = {
			name: 'text',
			options: {
				text: 'Default animation',
				scrollDelay: 7,
				iterations: 1,
			}
		};

        this.setupExpress();
		this.runAnimation('text', {text:':smiley:', iterations:1});

        this.queue.on('idle', () => {
			if (this.defaultAnimation) {
				this.runAnimation(this.defaultAnimation.name, this.defaultAnimation.options);
			}
        });

	}

};



