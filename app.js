#!/usr/bin/env node

var fs   = require('fs');
var path = require('path');
var args = require('yargs');

require('dotenv').config();
require('yow/prefixConsole')();


class App {

	constructor() {
		this.fileName = __filename;
	}


	
	loadSamples() {
		var folder = path.join(__dirname, './samples');

		fs.readdirSync(folder).forEach((file) => {

			var fileName = path.join(folder, file);
			var components = path.parse(fileName);

			if (components.ext == '.js') {
				var Command = require(fileName);
				var cmd = new Command(); 

				args.command({
					command: cmd.command,
					builder: cmd.builder,
					handler: cmd.handler,
					desc:    cmd.description 
				});  
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

		try {

			args.usage('Usage: $0 <command> [options]');

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