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

	getAnimation(name) {

		var animations = {
			text:    require('../src/text-animation.js'),
			rain:    require('../src/rain-animation.js'),
			weather: require('../src/weather-animation.js'),
			gif:     require('../src/gif-animation.js'),
			news:    require('../src/news-animation.js')
		};

		if (animations[name] == undefined)
			throw new Error(`Animation '${name}' was not found.`);

		return animations[name];
	}

	runAnimation(name, options) {
		var Animation = this.getAnimation(name);
		
		this.debug(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);
		this.queue.enqueue(new Animation(options));
	}


	runAnimations() {
		var os = require('os');
		var mqtt = require('mqtt');
		var animationTopic = `rpi/${os.hostname()}/animations`;

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

				if (!message.name)
					throw new Error('Animation name not specified in MQTT payload.');

				this.runAnimation(message.name, message.options);
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
			if (this.defaultAnimation) {
				this.runAnimation(this.defaultAnimation.name, this.defaultAnimation.options);
			}
        });

	}

};



