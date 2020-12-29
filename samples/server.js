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
/*

		for (var animationName in this.animations) {
			app.post(`/${animationName}`, (request, response) => {
				try {
					this.runAnimation(animationName, {...request.query, ...request.body});
					response.status(200).json({status:'OK'});    
				}
				catch(error) {
					response.status(401).json({status:error.message});    
				}
			});           			
		}
*/
		app.post(`/news`, (request, response) => {
			try {
				this.runAnimation('news', {...request.query, ...request.body});
				response.status(200).json({status:'OK'});    
			}
			catch(error) {
				response.status(401).json({status:error.message});    
			}
		});           

		app.get(`/text`, (request, response) => {
			try {
				this.runAnimation('text', {...request.query, ...request.body});
				response.status(200).json({status:'OK'});    
			}
			catch(error) {
				response.status(401).json({status:error.message});    
			}
		});           

		app.post(`/text`, (request, response) => {
			try {
				this.runAnimation('text', {...request.query, ...request.body});
				response.status(200).json({status:'OK'});    
			}
			catch(error) {
				response.status(401).json({status:error.message});    
			}
		});           

		app.post(`/gif`, (request, response) => {
			try {
				this.runAnimation('gif', {...request.query, ...request.body});
				response.status(200).json({status:'OK'});    
			}
			catch(error) {
				response.status(401).json({status:error.message});    
			}
		});           

		app.post(`/rain`, (request, response) => {
			try {
				this.runAnimation('rain', {...request.query, ...request.body});
				response.status(200).json({status:'OK'});    
			}
			catch(error) {
				response.status(401).json({status:error.message});    
			}
		});           

		app.post(`/weather`, (request, response) => {
			try {
				this.runAnimation('weather', {...request.query, ...request.body});
				response.status(200).json({status:'OK'});    
			}
			catch(error) {
				response.status(401).json({status:error.message});    
			}
		});           


        app.listen(this.argv.port);

	}
	
	runAnimation(name, options) {
        var Animation = this.animations[name];
        this.queue.enqueue(new Animation(options));
	}


	runAnimations() {
		var TextAnimation    = require('../src/text-animation.js');
		var RainAnimation    = require('../src/rain-animation.js');
		var NewsAnimation    = require('../src/news-animation.js');
		var WeatherAnimation = require('../src/weather-animation.js');
		var GifAnimation     = require('../src/gif-animation.js');

		this.animations = {};
		this.animations['text']    = TextAnimation;
		this.animations['rain']    = RainAnimation;
		this.animations['weather'] = WeatherAnimation;
		this.animations['gif']     = GifAnimation;
		this.animations['news']    = NewsAnimation;



		this.defaultAnimation = {
			name: 'rain',
			options: {
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



