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

    setup() {
		var mqtt = require('mqtt')
		var client  = mqtt.connect('mqtt://85.24.185.150');
 
		client.on('connect',  () => {
			client.subscribe('test/message',  (err) => {
				if (!err) {
					client.publish('test/message', 'Hello mqtt');
				}
			})
		})
		   /*
		client.on('test/message', (topic, message) => {
			// message is Buffer
			console.log('topic', topic)
			console.log('message', message.toString());
			client.end();
		})
		*/

	

	}
	
	runAnimation(name, options) {
		var Animation = this.animations[name];
		
		if (Animation == undefined)
			throw new Error(`Animation '${name}' was not found.`);

		this.debug(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);

		this.queue.enqueue(new Animation(options));
	}


	runAnimations() {
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
			options: {
			}
		};

        this.setup();
		this.runAnimation('text', {text:':smiley:', iterations:1});

        this.queue.on('idle', () => {
			if (this.defaultAnimation) {
				this.runAnimation(this.defaultAnimation.name, this.defaultAnimation.options);
			}
        });

	}

};



