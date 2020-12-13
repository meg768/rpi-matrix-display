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
            var {debug, ...argv} = argv; 
            this.argv = argv;

            if (debug) {
                this.debug = console.log;
            }
    
            this.run(this.argv = argv);
        };
    }


    options(yargs) {
        yargs.usage(`Usage: $0 ${this.command} [options]`);
        yargs.option('debug', { describe: 'Debug mode', type:'boolean', default:false});
    }

    run(argv) {
    }

};



