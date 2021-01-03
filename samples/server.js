var MatrixCommand = require('../src/matrix-command.js');





module.exports = class extends MatrixCommand {

    constructor(options) {


		super({command: 'server [options]', description: 'Run matrix server', ...options}); 


	}

    options(args) {
        super.options(args);
        args.option('port', {describe:'Port', default:4000});
    }

    setupServer() {
        var bodyParser = require('body-parser');
		var app = require('express')();
		var server = require('http').createServer(app);
		var io = require('socket.io')(server);

        app.use(bodyParser.urlencoded({ limit: '50mb', extended: false}));
        app.use(bodyParser.json({limit: '50mb'}));

		app.post(`/animate/:animation`, (request, response) => {
			try {
				this.runAnimation(request.params.animation, {...request.query, ...request.body});
				response.status(200).json({status:'OK'});    
			}
			catch(error) {
				response.status(401).json({error:error.message});    
			}
		});           

		app.get(`/animate/:animation`, (request, response) => {
			try {
				this.runAnimation(request.params.animation, {...request.query, ...request.body});
				response.status(200).json({status:'OK'});    
			}
			catch(error) {
				response.status(401).json({error:error.message});    
			}
		});           

		io.on('connection', (socket) => {
			console.log('A user connected');

			socket.on('disconnect', () => {
				console.log('A user disconnected');
			});	

			socket.on('animate', (animation, payload, callback) => {

				callback = typeof callback == "function" ? callback : () => {};
			
				try {
					throw new Error('Upps');
					this.runAnimation(animation, payload);
					callback({status:'OK'});
				}
				catch(error) {
					callback({error:error.message});
				}
	
			});

		});


        server.listen(this.argv.port);

	}
	
	runAnimation(name, options) {
		var Animation = this.animations[name];
		
		if (Animation == undefined)
			throw new Error(`Animation '${name}' was not found.`);

		console.log(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);

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

        this.setupServer();
		this.runAnimation('text', {text:':smiley:', iterations:1});

        this.queue.on('idle', () => {
			if (this.defaultAnimation) {
				this.runAnimation(this.defaultAnimation.name, this.defaultAnimation.options);
			}
        });

	}

};



