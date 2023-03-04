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