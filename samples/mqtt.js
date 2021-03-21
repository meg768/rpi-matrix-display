var MQTT = require('mqtt-ex');
var MatrixCommand = require('../src/matrix-command.js');
var TextAnimation = require('../src/text-animation.js');
var Timer = require('yow/timer');
var sprintf = require('yow/sprintf');
var OS = require("os");

module.exports = class extends MatrixCommand {

    constructor(options) {
		super({command: 'mqtt [options]', description: 'Run matrix MQTT server', ...options}); 

		this.hostname = OS.hostname();

		this.timer = new Timer();
		this.timers = {};
		this.cache = {};
		this.texts = [];
		this.config = {};

	}

	getCache(name) {
		let cache = this.cache[name];

		if (cache != undefined)
			return cache;

		return this.cache[name] = {};
	}

	getTimer(name) {
		let timer = this.timers[name];

		if (timer != undefined)
			return timer;

		return this.timers[name] = new Timer();
	}

    options(yargs) {
        super.options(yargs);

		yargs.option('host',     {describe:'Specifies MQTT host', default:this.getDefaultValue('mqttHost')});
		yargs.option('password', {describe:'Password for MQTT broker', default:this.getDefaultValue('mqttPassword')});
		yargs.option('username', {describe:'User name for MQTT broker', default:this.getDefaultValue('mqttUsername')});
		yargs.option('port',     {describe:'Port for MQTT', default:this.getDefaultValue('mqttPort', 1883)});

        yargs.option('textColor',   {describe: 'Text color', default:this.getDefaultValue('textColor', 'red')});
        yargs.option('emojiSize',   {describe: 'Size of emojis relative to matrix height', default:this.getDefaultValue('emojiSize', 0.75)});
        yargs.option('fontStyle',   {describe: 'Font style', default:'bold'});
        yargs.option('fontName',    {describe: 'Font name', default:'Arial'});
        yargs.option('scrollDelay', {describe: 'Scrolling speed', type:'number', default:this.getDefaultValue('scrollDelay', 10)});
    }

	
	displayText(text, options = {}) {
		this.queue.enqueue(new TextAnimation({...this.argv, iterations:1, ...options, text:`${text}`}));
	}

	async start() {
		console.log(this.argv);
		await super.start();

		this.debug(`Connecting to host '${this.argv.host}'...`);
		var mqtt = MQTT.connect(this.argv.host, {username:process.env.MQTT_USERNAME, password:process.env.MQTT_PASSWORD, port:process.env.MQTT_PORT});

		mqtt.on('connect', () => {
			this.log(`Connected to ${this.argv.host}:${this.argv.port}...`);
			this.runAnimation('text', {text:'🤪'});
		})

		mqtt.subscribe('RSS/+/+');
		mqtt.subscribe('Yahoo Quotes/+/+');		
		mqtt.subscribe(`Raspberry/${this.hostname}/#`);

		mqtt.on(`Raspberry/${this.hostname}/:animation`, (topic, message, args) => {

			try {
				if (message != '') {
					var payload = JSON.parse(message);
					this.log(`Config ${args.animation}:${JSON.stringify(payload)}`);
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
					this.runAnimation(args.animation, {...this.config[args.animation], ...payload});	
				}
			}
			catch(error) {
				this.log(error);
			}
		});


		mqtt.on('RSS/:name/title', (topic, message, args) => {
			try {
				if (message == '')
					return;

				var json = JSON.parse(message);
				var text = `${args.name} - ${json}`;

				this.runAnimation('text', {...this.argv, iterations:1, text:text});	
			}
			catch(error) {
				this.log(error);
			}
		});

		mqtt.on('Yahoo Quotes/:name/:prop', (topic, message, args) => {
			try {
				if (message == '')
					return;

				this.debug(`${topic}:${message}`);
				
				let json  = JSON.parse(message);
				let id    = `Yahoo Quotes/${args.name}`; 
				let quote = this.getCache(id);
				let timer = this.getTimer(id);

				quote[args.prop] = json;

				timer.setTimer(2000, () => {
					if (quote.price != undefined && quote.change != undefined) {

						//let text = sprintf('%s - %.02f (%.01f%%)', args.name, quote.price, quote.change);
						let text = sprintf('%s %s%.01f%%', args.name, quote.change < 0 ? '' : '+', quote.change);
						this.runAnimation('text', {...this.argv, iterations:1, text:text, textColor:quote.change < 0 ? 'red' : 'blue'});
	
					} 
	
				});
			}
			catch(error) {
				this.log(error);
			}
		});


        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.log(`Idle`);
				//this.runAnimation('rain', {});
            })
        });

	}



};



