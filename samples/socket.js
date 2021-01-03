var MatrixCommand = require('../src/matrix-command.js');




module.exports = class extends MatrixCommand {

    constructor(options) {


		super({command: 'socket [options]', description: 'Run socket.io server', ...options}); 


	}

    options(args) {
        super.options(args);
        args.option('port', {describe:'Port', default:4000});
    }

    setupExpress() {
		var server = require('http').createServer();
		var io = require('socket.io')(server);

		io.on('connection', (socket) => {
			console.log('a user connected');

			socket.on('disconnect', () => {
				console.log('user disconnected');
			});	

			socket.on('animate', XXX, (payload) => {
				try {
					this.runAnimation(XXX, payload);
					console.log('Displaying animation', XXX, payload);
				}
				catch(error) {
					console.error(error.message);
				}
	
			});

			socket.on('news', (payload) => {
				try {
					this.runAnimation('news', payload);
					console.log('Displaying news');
				}
				catch(error) {
					console.error(error.message);
				}
	
			});
		});

		console.log('Listening to port', this.argv.port);
        server.listen(this.argv.port);

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



