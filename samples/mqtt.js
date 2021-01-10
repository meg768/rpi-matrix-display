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
		var mqtt = require('mqtt');
		var animationTopic = `rpi/${os.hostname()}/animations`;

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
		var client = mqtt.connect(this.argv.host, {username:process.env.MQTT_USERNAME, password:process.env.MQTT_PASSWORD});


		client.on('connect', () => {
			this.debug('Connected to MQTT Broker.');
			this.debug(`Subscribing to ${animationTopic}...`);

			client.subscribe(animationTopic,  (error) => {
				if (error) {
					console.error(`Could not subscribe to topic '${animationTopic}'.`);
				}
			});
		})
		
		client.on('message', (topic, message) => {

			message = message.toString();

			this.debug(`Topic ${topic}`);
			this.debug(`Message ${message}`);

			try {
				message = JSON.parse(message);
			}
			catch(error) {
				this.debug(`Could not parse JSON payload '${message}'.`)
				console.error(error);
				message = {};
			}


			try {
				if (message.animation)
					this.runAnimation(message.animation, message.options);
			}
			catch(error) {
				console.error(error);
			}
		});

		this.defaultAnimation = {
			animation: 'rain',
			options: {
			}
		};

		this.runAnimation('text', {text:':smiley:', iterations:1});

        this.queue.on('idle', () => {
			if (this.defaultAnimation) {
				this.runAnimation(this.defaultAnimation.animation, this.defaultAnimation.options);
			}
        });

	}

};



