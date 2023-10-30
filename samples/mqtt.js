var MQTT = require('mqtt');
var MatrixCommand = require('../src/matrix-command.js');
var Timer = require('yow/timer');
var OS = require("os");

var TextAnimation    = require('../src/text-animation.js');
var RainAnimation    = require('../src/rain-animation.js');
var NewsAnimation    = require('../src/news-animation.js');
var WeatherAnimation = require('../src/weather-animation.js');
var GifAnimation     = require('../src/gif-animation.js');

module.exports = class extends MatrixCommand {

    constructor(options) {
		super({command: 'mqtt [options]', description: 'Run matrix MQTT server', ...options}); 

        this.animations = {};
		this.animations['text']    = TextAnimation;
		this.animations['rain']    = RainAnimation;
		this.animations['weather'] = WeatherAnimation;
		this.animations['gif']     = GifAnimation;
		this.animations['news']    = NewsAnimation;

        

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

	runAnimation(name, options) {
		var Animation = this.animations[name];
		
		if (Animation == undefined)
			throw new Error(`Animation '${name}' was not found.`);

		this.debug(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);

		this.queue.enqueue(new Animation(options));
	}    

	async start() {
		await super.start();

		this.debug(`Connecting to host '${this.argv.host}'...`);
		var mqtt = MQTT.connect(this.argv.host, {username:this.argv.username, password:this.argv.password, port:this.argv.port});

		mqtt.on('connect', () => {
			this.log(`Connected to ${this.argv.host}:${this.argv.port}...`);
			this.displayText(`Listening to MQTT topic ${this.argv.topic}... 🤪`);
		})

		mqtt.subscribe(this.argv.topic, (error) => {

        });


		mqtt.on('message', (topic, message) => {
			try {
                message = message.toString();

                this.log(`MQTT message: '${message}'`);

                if (message == '')
                    return

                try {
                    let payload = JSON.parse(message)
                    let {animation, ...options} = payload;

                    this.runAnimation(animation, options);
                }
                catch(error) {
                    this.displayText(error);

                }

                this.queue.enqueue(new TextAnimation({...this.argv, iterations:1, ...payload}));

            }
			catch(error) {
				this.log(error);
			}
		});


/*
        this.queue.on('idle', () => {
            this.timer.setTimer(1 * 1000, () => {
                this.debug(`Idle`);
            })
        });
*/
	}



};



