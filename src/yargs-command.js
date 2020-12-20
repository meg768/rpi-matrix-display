
module.exports = class Command {

    constructor(options) {
        var {command, description} = options;

        this.command = command;
        this.description = description;
        this.debug = () => {};

        this.builder = (yargs) => {
            this.options(yargs);
        };

        this.handler = (argv) => {
            try {
                this.argv = argv;
                this.debug = typeof argv.debug === 'function' ? argv.debug : (argv.debug ? console.log : () => {});
                
                this.run();
            }
            catch (error) {
                console.error(error.stack);
                process.exit(-1);
            }            
        };
    }


    options(yargs) {
        yargs.usage(`Usage: $0 ${this.command} [options]`);
        yargs.option('debug', {describe: 'Debug mode', type:'boolean'});
    }

    run() {
    }

};



