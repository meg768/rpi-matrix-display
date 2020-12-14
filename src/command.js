var sprintf = require('yow/sprintf');

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
                var {debug, ...argv} = argv; 

                if (debug) {
                    this.debug = console.log;
                }
        
                this.run(this.argv = argv);
            }
            catch (error) {
                console.error(error.stack);
            }            
        };
    }


    options(yargs) {
        yargs.usage(`Usage: $0 ${this.command} [options]`);
        yargs.option('debug', { describe: 'Debug mode', type:'boolean', default:false});
    }

    run(argv) {
    }

};



