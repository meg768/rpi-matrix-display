var MQTT = require('mqtt-ex');
var MatrixCommand = require('../src/matrix-command.js');
var TextAnimation = require('../src/text-animation.js');
var Timer = require('yow/timer');
var OS = require("os");

module.exports = class extends MatrixCommand {

    constructor(options) {
		super({command: 'mqtt [options]', description: 'Run matrix MQTT server', ...options}); 

		this.hostname = OS.hostname();

		this.timer = new Timer();
		this.texts = [];
		this.config = {};

	}

    options(yargs) {
        super.options(yargs);

		if (process.env.MQTT_PORT == undefined)
			process.env.MQTT_PORT = 1883;

		yargs.option('host',     {describe:'Specifies MQTT host', default:process.env.MQTT_HOST});
		yargs.option('password', {describe:'Password for MQTT broker', default:process.env.MQTT_PASSWORD});
		yargs.option('username', {describe:'User name for MQTT broker', default:process.env.MQTT_USERNAME});
		yargs.option('port',     {describe:'Port for MQTT', default:process.env.MQTT_PORT });

        yargs.option('textColor',   {describe: 'Text color', default:'red'});
        yargs.option('emojiSize',   {describe: 'Size of emojis relative to matrix height', default:0.75});
        yargs.option('fontStyle',   {describe: 'Font style', default:'bold'});
        yargs.option('fontName',    {describe: 'Font name', default:'Arial'});
        yargs.option('scrollDelay', {describe: 'Scrolling speed', default:10});
    }

	
	displayText(text) {
		this.queue.enqueue(new TextAnimation({...this.argv, iterations:1, text:`${text}`}));
	}

	runAnimation(name, options) {

		var TextAnimation    = require('../src/text-animation.js');
		var RainAnimation    = require('../src/rain-animation.js');
		var NewsAnimation    = require('../src/news-animation.js');
		var WeatherAnimation = require('../src/weather-animation.js');
		var GifAnimation     = require('../src/gif-animation.js');

		var animations = {};
		animations['text']    = TextAnimation;
		animations['rain']    = RainAnimation;
		animations['weather'] = WeatherAnimation;
		animations['gif']     = GifAnimation;
		animations['news']    = NewsAnimation;		
		
		var Animation = animations[name];
		var config = this.config[name] || {};

		options = {...config, ...options};
		
		if (Animation == undefined)
			throw new Error(`Animation '${name}' was not found.`);

		this.debug(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);
		this.queue.enqueue(new Animation(options));
	}
	
	async start() {
		await super.start();

		this.config = {};

		this.debug(`Connecting to host '${this.argv.host}'...`);
		var mqtt = MQTT.connect(this.argv.host, {username:process.env.MQTT_USERNAME, password:process.env.MQTT_PASSWORD, port:process.env.MQTT_PORT});

		mqtt.on('connect', () => {
			this.log(`Connected to ${this.argv.host}:${this.argv.port}...`);
			this.runAnimation('text', {text:'Foo'});
		})

		this.debug(`*************Raspberry/${this.hostname}/:animation`);

		//mqtt.subscribe('RSS/#');
		mqtt.subscribe(`Raspberry/${this.hostname}/#`);

		mqtt.on(`Raspberry/${this.hostname}/:animation`, (topic, message, args) => {

			try {
				if (message != '') {
					var payload = JSON.parse(message);
					this.debug(`Config ${args.animation}:${JSON.stringify(payload)}`);
					this.config[args.animation] = payload;
				}
			}
			catch(error) {
				this.log(error);
			}
		});

		mqtt.on(`Raspberry/${this.hostname}/:animation/animate`, (topic, message, args) => {

			try {
				if (message != '') {
					var payload = JSON.parse(message);
					this.runAnimation(args.animation, payload);	
				}
			}
			catch(error) {
				this.log(error);
			}
		});



		mqtt.on('RSS/:name/title', (topic, message, args) => {

			try {
				var json = JSON.parse(message);
				var text = `${args.name} - ${json}`;

				this.queue.enqueue(new TextAnimation({...this.argv, iterations:1, text:`${text}`}));
			}
			catch(error) {
				this.log(error);
			}
		});


        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.log(`Idle`);
            })
        });

	}



};



