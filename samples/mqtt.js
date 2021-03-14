var MQTT = require('mqtt-ex');
var MatrixCommand = require('../src/matrix-command.js');
var TextAnimation = require('../src/text-animation.js');


module.exports = class extends MatrixCommand {

    constructor(options) {
		super({command: 'mqtt [options]', description: 'Run matrix MQTT server', ...options}); 

	}

    options(yargs) {
        super.options(yargs);

		yargs.option('host',     {describe:'Specifies MQTT host', default:process.env.MQTT_HOST});
		yargs.option('password', {describe:'Password for MQTT broker', default:process.env.MQTT_PASSWORD});
		yargs.option('username', {describe:'User name for MQTT broker', default:process.env.MQTT_USERNAME});
		yargs.option('port',     {describe:'Port for MQTT', default:process.env.MQTT_PORT});

        yargs.option('textColor',   {describe: 'Text color', default:'red'});
        yargs.option('emojiSize',   {describe: 'Size of emojis relative to matrix height', default:0.75});
        yargs.option('fontStyle',   {describe: 'Font style', default:'bold'});
        yargs.option('fontName',    {describe: 'Font name', default:'Arial'});
        yargs.option('scrollDelay', {describe: 'Scrolling speed', default:10});


    }

	runAnimation(name, options) {
		var Animation = this.getAnimation(name);
		
		this.debug(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);
		this.queue.enqueue(new Animation(options));
		this.mqtt.publish(`${this.mqttTopic}/current`, JSON.stringify({name:name, options: options}));
	}


    enqueueAnimations() {
        this.queue.enqueue(new TextAnimation({...this.argv}));
    }


	async start() {
		await super.start();
		
		this.debug(`Connecting to host '${this.argv.host}'...`);
		var mqtt = MQTT.connect(this.argv.host, {username:process.env.MQTT_USERNAME, password:process.env.MQTT_PASSWORD, port:process.env.MQTT_PORT});

		mqtt.on('connect', () => {
			this.log(`Connected to MQTT Broker ${this.argv.host}:${this.argv.port}...`);
		})

		mqtt.subscribe('RSS/#');

		mqtt.on('RSS/:name/title', (topic, message) => {

			this.debug(`Topic ${topic}`);
			this.debug(`Message ${message}`);

			try {
				var json = JSON.parse(message);
				this.queue.enqueue(new TextAnimation({...this.argv, text:json}));
			}
			catch(error) {
				this.log(error);
			}
		});


	}

	runAnimations() {

		this.debug(`Connecting to host '${this.argv.host}'...`);
		var mqtt = MQTT.connect(this.argv.host, {username:process.env.MQTT_USERNAME, password:process.env.MQTT_PASSWORD, port:process.env.MQTT_PORT});

		mqtt.on('connect', () => {
			this.log(`Connected to MQTT Broker ${this.argv.host}:${this.argv.port}...`);
		})

		mqtt.subscribe('RSS/#');

		mqtt.on('RSS/:name/title', (topic, message) => {

			this.debug(`Topic ${topic}`);
			this.debug(`Message ${message}`);

			try {
				var json = JSON.parse(message);
				this.queue.enqueue(new TextAnimation({...this.argv, text:json}));
			}
			catch(error) {
				this.log(error);
			}
		});

		this.enqueueAnimations();

        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.enqueueAnimations();
            })
        });



	}

};



