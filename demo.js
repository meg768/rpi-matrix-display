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


	run() {
		try {
			args.usage('Usage: $0 <command> [options]')

            args.option('led-cols',                {describe:'Number of columns for display', default:process.env.LED_COLS || 32});
            args.option('led-rows',                {describe:'Number of rows for display', default:process.env.LED_ROWS || 32});
            args.option('led-chain',               {describe:'Number of daisy-chained panels', default:process.env.LED_CHAIN || 1});
            args.option('led-parallel',            {describe:'For A/B+ models or RPi2,3b: parallel chains.', default:process.env.LED_PARALLEL || 1});
		   /*
			args.option('led-gpio-mapping',        {describe:'Type of hardware used', default:'regular'});
            args.option('led-rgb-sequence',        {describe:'Matrix RGB color order', default:'RGB'});
            args.option('led-scan-mode',           {describe:'Scan mode (0/1)', default:0});
            args.option('led-inverse-colors',      {describe:'Inverse colors', default:0});
            args.option('led-pwm-bits',            {describe:'Color depth', default:11});
            args.option('led-pwm-lsb-nanoseconds', {describe:'Tweak timing', default:130});
            args.option('led-brightness',          {describe:'Display brightness', default:100});
            args.option('led-multiplexing',        {describe:'Multiplexing type (0-4).', default:0});
            args.option('led-show-refresh',        {describe:'Show refresh rate.', default:false});
*/
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