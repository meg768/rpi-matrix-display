var MQTT = require('mqtt');
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

		yargs.option('host',     {describe:'Specifies MQTT host', default:process.env.MQTT_HOST});
		yargs.option('password', {describe:'Password for MQTT broker', default:process.env.MQTT_PASSWORD});
		yargs.option('username', {describe:'User name for MQTT broker', default:process.env.MQTT_USERNAME});
		yargs.option('port',     {describe:'Port for MQTT', default:process.env.MQTT_PORT});
		yargs.option('topic',    {describe:'Topic for MQTT', default:process.env.MQTT_TOPIC});

        yargs.option('textColor',   {describe: 'Text color', default:'red'});
        yargs.option('emojiSize',   {describe: 'Size of emojis relative to matrix height', default:0.75});
        yargs.option('fontStyle',   {describe: 'Font style', default:'bold'});
        yargs.option('fontName',    {describe: 'Font name', default:'Arial'});
        yargs.option('scrollDelay', {describe: 'Scrolling speed', type:'number', default:10});
    }

	
	displayText(text, options = {}) {
		this.queue.enqueue(new TextAnimation({...this.argv, iterations:1, ...options, text:`${text}`}));
	}

	async start() {
		await super.start();

		this.debug(`Connecting to host '${this.argv.host}'...`);
		var mqtt = MQTT.connect(this.argv.host, {username:this.argv.username, password:this.argv.password, port:this.argv.port});

		mqtt.on('connect', () => {
			this.log(`Connected to ${this.argv.host}:${this.argv.port}...`);
			this.displayText('🤪');
		})

		mqtt.subscribe(this.argv.topic, (error) => {

        });


		mqtt.on('message', (topic, message) => {
			try {
                message = message.toString();

                if (message == '')
                    return

                let payload = {text:message}

                try {
                    payload = JSON.parse(message)
                }
                catch(error) {

                }

                this.queue.enqueue(new TextAnimation({...this.argv, iterations:1, ...payload}));

            }
			catch(error) {
				this.log(error);
			}
		});



        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.debug(`Idle`);
            })
        });

	}



};



