var MatrixCommand = require('../src/matrix-command.js');


module.exports = class extends MatrixCommand {

    constructor(options) {
		super({command: 'mqtt [options]', description: 'Run matrix MQTT server', ...options}); 

	}

    options(args) {
        super.options(args);
        args.option('port', {describe:'Port', default:1883});
        args.option('host', {describe:'Address of MQTT broker', default:''});
    }

	runAnimation(name, options) {
		var Animation = this.animations[name];
		
		if (Animation == undefined)
			throw new Error(`Animation '${name}' was not found.`);

		this.debug(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);

		this.queue.enqueue(new Animation(options));
	}


	runAnimations() {
		var mqtt = require('mqtt')
		var client = mqtt.connect('mqtt://85.24.185.150');

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

		client.on('connect', () => {
			this.debug('Connected to MQTT Broker.');
			client.subscribe(['rain','weather','gif','news','text'],  (error) => {
				if (error) {
					this.log('Could not subscribe.')
				}
			});
		})
		
		client.on('message', (topic, message) => {

			topic = topic.toString();
			message = message.toString();

			try {
				json = message == '' ? {} : JSON.parse(message);
				this.runAnimation(topic, json);
			}
			catch(error) {
				this.log(error.message);
			}
		});

		this.defaultAnimation = {
			name: 'rain',
			options: {
			}
		};

		this.runAnimation('text', {text:':smiley:', iterations:1});

        this.queue.on('idle', () => {
			client.publish('idle', JSON.stringify({message:'Idle'}));
			if (this.defaultAnimation) {
				this.runAnimation(this.defaultAnimation.name, this.defaultAnimation.options);
			}
        });

	}

};



