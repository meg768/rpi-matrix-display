var MatrixCommand = require('../src/matrix-command.js');


module.exports = class extends MatrixCommand {

    constructor(options) {
		super({command: 'mqtt [options]', description: 'Run matrix MQTT server', ...options}); 

	}

    options(args) {
        super.options(args);
        args.option('port', {describe:'Port', default:1883});
        args.option('host', {describe:'Address of MQTT broker', default:process.env.MQTT_HOST});
    }

	runAnimation(name, options) {
		var Animation = this.animations[name];
		
		if (Animation == undefined)
			throw new Error(`Animation '${name}' was not found.`);

		this.debug(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);

		this.queue.enqueue(new Animation(options));
	}


	runAnimations() {
		var os = require('os');
		var mqtt = require('mqtt')
		var topicPrefix = `rpi/${os.hostname()}`;

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

		this.debug(`Connecting to host '${this.argv.host}'...`);
		var client = mqtt.connect(this.argv.host);


		client.on('connect', () => {
			this.debug('Connected to MQTT Broker.');

			var animations = ['rain','weather','gif','news','text'];

			animations.forEach((animation) => {
				var topic = `${topicPrefix}/${animation}`;

				this.debug(`Subscribing to ${topic}...`);

				client.subscribe(topic,  (error) => {
					if (error) {
						console.error(`Could not subscribe to topic '${topic}'.`);
					}
				});
	
			});
		})
		
		client.on('message', (topic, message) => {

			topic = topic.toString();
			message = message.toString();

			this.debug(`Topic ${topic}`);
			this.debug(`Message ${message}`);

			try {
				var paths = topic.split('/');
				var animation = paths[paths.length - 1];

				var json = message == '' ? {} : JSON.parse(message);
				this.runAnimation(animation, json);
			}
			catch(error) {
				console.error(error);
			}
		});

		this.defaultAnimation = {
			name: 'rain',
			options: {
			}
		};

		this.runAnimation('text', {text:':smiley:', iterations:1});

        this.queue.on('idle', () => {
			client.publish(`${topicPrefix}/status`, JSON.stringify({message:'Idle'}));
			if (this.defaultAnimation) {
				this.runAnimation(this.defaultAnimation.name, this.defaultAnimation.options);
			}
        });

	}

};



