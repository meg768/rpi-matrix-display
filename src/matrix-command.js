
var Matrix           = require('rpi-matrix');
var AnimationQueue   = require('./animation-queue.js');
var YargsCommand     = require('./yargs-command.js');
/*

var TextAnimation    = require('../src/text-animation.js');
var RainAnimation    = require('../src/rain-animation.js');
var NewsAnimation    = require('../src/news-animation.js');
var WeatherAnimation = require('../src/weather-animation.js');
var GifAnimation     = require('../src/gif-animation.js');
*/

module.exports = class extends YargsCommand {

    constructor(options) {
        super(options); 

		this.queue = new AnimationQueue();
    }


	getDefaultConfig() {
		var config = {};

		function getValue(value, defaultValue) {
			if (value == undefined)
				return defaultValue;

			if (typeof defaultValue == 'number')
				return parseInt(value);

			if (typeof defaultValue == 'boolean')
				return parseInt(value) != 0;
			
			return value;
		}

		config['led-gpio-mapping'] = getValue(process.env.LED_GPIO_MAPPING, 'regular');
		config['led-rows'] = getValue(process.env.LED_ROWS, 32);
		config['led-cols'] = getValue(process.env.LED_COLS, 64);
		config['led-chain'] = getValue(process.env.LED_CHAIN, 1);
		config['led-parallel'] = getValue(process.env.LED_PARALLEL, 1);
		config['led-multiplexing'] = getValue(process.env.LED_MULTIPLEXING, 0);
		config['led-pwm-bits'] = getValue(process.env.LED_PWM_BITS, 11);
		config['led-brightness'] = getValue(process.env.LED_BRIGHTNESS, 100);
		config['led-scan-mode'] = getValue(process.env.LED_SCAN_MODE, 0);
		config['led-row-addr-type'] = getValue(process.env.LED_ROW_ADDR_TYPE, 0);
		config['led-show-refresh'] = getValue(process.env.LED_SHOW_REFRESH, false);
		config['led-inverse'] = getValue(process.env.LED_INVERSE, false);
		config['led-rgb-sequence'] = getValue(process.env.LED_RGB_SEQUENCE, 'RGB');
		config['led-pwm-lsb-nanoseconds'] = getValue(process.env.LED_PWM_LSB_NANOSECONDS, 130);
		config['led-pwm-dither-bits'] = getValue(process.env.LED_PWM_DITHER_BITS, 0);
		config['led-no-hardware-pulse'] = getValue(process.env.LED_NO_HARDWARE_PULSE, false);
		config['led-slowdown-gpio'] = getValue(process.env.LED_SLOWDOWN_GPIO, 1);

		return config;
    }
    
    options(args) {
        super.options(args);

        var defaultConfig = this.getDefaultConfig();

        args.option('led-cols',                {describe:'Number of columns for display', default:defaultConfig['led-cols']});
        args.option('led-rows',                {describe:'Number of rows for display', default:defaultConfig['led-rows']});
        args.option('led-chain',               {describe:'Number of daisy-chained panels', default:defaultConfig['led-chain']});
        args.option('led-parallel',            {describe:'For A/B+ models or RPi2,3b: parallel chains.', default:defaultConfig['led-parallel']});
       
        args.option('led-gpio-mapping',        {describe:'Type of hardware used', default:defaultConfig['led-gpio-mapping']});
        args.option('led-rgb-sequence',        {describe:'Matrix RGB color order', default:defaultConfig['led-rgb-sequence']});
        args.option('led-scan-mode',           {describe:'Scan mode (0/1)', default:defaultConfig['led-scan-mode']});
        args.option('led-inverse',             {describe:'Inverse colors', default:defaultConfig['led-inverse']});
        args.option('led-pwm-bits',            {describe:'Color depth', default:defaultConfig['led-pwm-bits']});
        args.option('led-pwm-lsb-nanoseconds', {describe:'Tweak timing', default:defaultConfig['led-pwm-lsb-nanoseconds']});
        args.option('led-pwm-dither-bits',     {describe:'Slowdown GPIO. Needed for faster Pis/slower panels', default:defaultConfig['led-pwm-dither-bits']});
        args.option('led-brightness',          {describe:'Display brightness', default:defaultConfig['led-brightness']});
        args.option('led-multiplexing',        {describe:'Multiplexing type (0-4).', default:defaultConfig['led-multiplexing']});
        args.option('led-show-refresh',        {describe:'Show refresh rate.', default:defaultConfig['led-show-refresh']});
        args.option('led-slowdown-gpio',       {describe:'Slowdown GPIO. Needed for faster Pis/slower panels', default:defaultConfig['led-slowdown-gpio']});

    }
/*
	runAnimation(name, options) {


		var animations = {};
		animations['text']    = TextAnimation;
		animations['rain']    = RainAnimation;
		animations['weather'] = WeatherAnimation;
		animations['gif']     = GifAnimation;
		animations['news']    = NewsAnimation;		
		
		var Animation = animations[name];
		
		if (Animation == undefined)
			throw new Error(`Animation '${name}' was not found.`);

		this.debug(`Displaying animation '${name}' with payload ${JSON.stringify(options)}...`);
		this.queue.enqueue(new Animation(options));
	}	
  */  
	async start() {
		await super.start();
        Matrix.configure({...this.argv});
	}



};






