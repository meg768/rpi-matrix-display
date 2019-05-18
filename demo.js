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

		function integerValue(value, defaultValue) {
			return value == undefined ? defaultValue : parseInt(value);
		}

		function stringValue(value, defaultValue) {
			return value == undefined ? defaultValue : value;
		}

		config['led-cols'] = integerValue(process.env.LED_COLS, 32);
		config['led-rows'] = integerValue(process.env.LED_ROWS, 32);
		config['led-chain'] = integerValue(process.env.LED_CHAIN, 1);
		config['led-parallel'] = integerValue(process.env.LED_PARALLEL, 1);

		config['led-gpio-mapping'] = stringValue(process.env.LED_GPIO_MAPPING, 'regular');
		config['led-rgb-sequence'] = stringValue(process.env.LED_GPIO_MAPPING, 'RGB');

		return config;
	}

	run() {
		try {

			var defaultConfig = this.getDefaultConfig();

			args.usage('Usage: $0 <command> [options]')

            args.option('led-cols',                {describe:'Number of columns for display', default:defaultConfig['led-cols']});
            args.option('led-rows',                {describe:'Number of rows for display', default:defaultConfig['led-rows']});
            args.option('led-chain',               {describe:'Number of daisy-chained panels', default:defaultConfig['led-chain']});
            args.option('led-parallel',            {describe:'For A/B+ models or RPi2,3b: parallel chains.', default:defaultConfig['led-parallel']});
		   
			args.option('led-gpio-mapping',        {describe:'Type of hardware used', default:defaultConfig['led-gpio-mapping']});
            args.option('led-rgb-sequence',        {describe:'Matrix RGB color order', default:defaultConfig['led-rgb-sequence']});
            args.option('led-scan-mode',           {describe:'Scan mode (0/1)', default:0});
            args.option('led-inverse-colors',      {describe:'Inverse colors', default:0});
            args.option('led-pwm-bits',            {describe:'Color depth', default:11});
            args.option('led-pwm-lsb-nanoseconds', {describe:'Tweak timing', default:130});
            args.option('led-brightness',          {describe:'Display brightness', default:100});
            args.option('led-multiplexing',        {describe:'Multiplexing type (0-4).', default:0});
            args.option('led-show-refresh',        {describe:'Show refresh rate.', default:false});

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