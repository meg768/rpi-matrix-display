
module.exports = class Command {

    constructor(options) {
        var {command, description} = options;

        this.command = command;
        this.description = description;
		this.log = console.log;
        this.debug = () => {};

        this.builder = (yargs) => {
            this.options(yargs);
        };

        this.handler = async (argv) => {
            try {
				this.argv = argv;
				
				await this.start();
                await this.run();
				await this.stop();
            }
            catch (error) {
                this.log(error.stack);
                process.exit(-1);
            }            
        };
    }

	getDefaultValue(parameter, defaultValue) {

		try {
			let name = parameter.split(/(?=[A-Z])/).join('_').toUpperCase();
			let value = process.env[name];
	
			if (typeof defaultValue == 'number')
				value = JSON.parse(value);
	
			if (typeof defaultValue == 'boolean')
				value = parseInt(value) != 0;			
	
			return value != undefined ? value : defaultValue; 
	
		}
		catch (error) {
			return undefined;
		}
	}


    options(yargs) {
        yargs.usage(`Usage: $0 ${this.command} [options]`);
        yargs.option('debug', {describe: 'Debug mode', type:'boolean', default:this.getDefaultValue('debug', false)});
    }

	async start() {
		this.debug = typeof this.argv.debug === 'function' ? this.argv.debug : (this.argv.debug ? this.log : () => {});	
	}

    async run() {
    }

	async stop() {
	}

};



