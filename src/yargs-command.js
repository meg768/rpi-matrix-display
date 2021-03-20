
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


    options(yargs) {
        yargs.usage(`Usage: $0 ${this.command} [options]`);
        yargs.option('debug', {describe: 'Debug mode', type:'boolean', default:process.env.DEBUG == '1'});
    }

	async start() {
		this.log = console.log;
		this.debug = typeof this.argv.debug === 'function' ? this.argv.debug : (this.argv.debug ? this.log : () => {});
		
}

    async run() {
    }

	async stop() {
	}

};



