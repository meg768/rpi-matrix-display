var MatrixCommand = require('../src/matrix-command.js');





module.exports = class extends MatrixCommand {

    constructor(options) {
		super({command: 'server [options]', description: 'Run matrix server', ...options}); 
	}

    options(args) {
        super.options(args);
        args.option('port', {describe:'Port', default:80});
    }


    setupServer() {
        var bodyParser = require('body-parser');
		var app = require('express')();
		var server = require('http').createServer(app);
		var io = require('socket.io')(server);

        app.use(bodyParser.urlencoded({ limit: '50mb', extended: false}));
        app.use(bodyParser.json({limit: '50mb'}));

        app.post(`/:animation`, (request, response) => {
			try {
				this.runAnimation(request.params.animation, {...request.query, ...request.body});
				response.status(200).json({status:'OK'});    
			}
			catch(error) {
				response.status(401).json({error:error.message});    
			}
		});           


		io.on('connection', (socket) => {
			this.debug('A socket connected.');

			socket.on('disconnect', () => {
				this.debug('A socket disconnected.');
			});	

			socket.on('animate', (animation, payload, callback) => {

				callback = typeof callback == "function" ? callback : () => {};

				try {
					this.runAnimation(animation, payload);
					callback({status:'OK'});
				}
				catch(error) {
					callback({error:error.message});
				}

			});

			socket.on('text', (payload, callback) => {

				callback = typeof callback == "function" ? callback : () => {};

				try {
					this.runAnimation('text', payload);
					callback({status:'OK'});
				}
				catch(error) {
					callback({error:error.message});
				}

			});


		});

        this.debug(`Setting up server on port ${this.argv.port}.`);

        server.listen(this.argv.port);

	}
	
	runAnimation(name, options) {
		var Animation = this.animations[name];
		
		if (Animation == undefined)
			throw new Error(`Animation '${name}' was not found.`);

		this.debug(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);

		this.queue.enqueue(new Animation(options));
	}

    
	async run() {

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
		this.runAnimation('text', {text:'Server started 🤪...', iterations:1});
return;
        this.queue.on('idle', () => {
			if (this.defaultAnimation) {
				this.runAnimation(this.defaultAnimation.name, this.defaultAnimation.options);
			}
        });

	}

};



