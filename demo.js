#!/usr/bin/env node

var fs   = require('fs');
var path = require('path');
var args = require('yargs');


class App {

	constructor() {
		this.fileName = __filename;

        // Load .env
        require('dotenv').config({
            path: path.join(__dirname, './.env')
        });

	}


	
	loadSamples() {
		var folder = path.join(__dirname, './samples');

		fs.readdirSync(folder).forEach((file) => {

			var fileName = path.join(folder, file);
			var components = path.parse(fileName);

			if (components.ext == '.js') {
				args.command(require(fileName));  
			}

		})

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
		config['led-cols'] = getValue(process.env.LED_COLS, 32);
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
		config['led-pwm-dither-bits'] = getValue(process.env.LED_PWM_DITHER_BITS, 0);

		return config;
	}

	run() {

		require('yow/prefixConsole')();
		
		try {

			var defaultConfig = this.getDefaultConfig();

			args.usage('Usage: $0 <command> [options]')

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

			this.loadSamples();  

			args.help();
			args.wrap(null);

			args.check(function() {
				return true;
			});

			args.demand(1);

			args.argv;

		}
		catch(error) {
			console.error(error.stack);
		}

	};

};


var app = new App();
app.run();