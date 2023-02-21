var MatrixCommand = require('../src/matrix-command.js');





module.exports = class extends MatrixCommand {

    constructor(options) {
		super({command: 'websocket-server [options]', description: 'Run matrix server', ...options}); 
	}

    options(args) {
        super.options(args);
        args.option('port', {describe:'Port', default:4096});
    }


    setup() {
		var ws = require('ws');
        var wss = new ws.WebSocketServer({ port: this.argv.port });

        this.debug(`Setting up WebSocket server on port ${this.argv.port}.`);

        wss.on('connection', (ws) => {
            this.debug(`Client connected`);

            ws.on('error', console.error);
          
            ws.on('message', (data) => {
                var text = data.toString();
                this.debug(text);

            });

        });
        
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
            priority: 'low',
			options: {
			}
		};

        this.setup();
		this.runAnimation('text', {text:'Server started 🤪...', iterations:1});

        /*
        this.queue.on('idle', () => {
			if (this.defaultAnimation) {
				this.runAnimation(this.defaultAnimation.name, this.defaultAnimation.options);
			}
        });
        */

	}

};



