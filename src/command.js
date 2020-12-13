var sprintf = require('yow/sprintf');

module.exports = class Command {

    constructor(options) {
        var {command, description} = options;

        this.command = command;
        this.description = description;


        this.debug = console.log;

    }

    options(args) {
        args.usage(`Usage: $0 ${this.command} [options]`);
    }

    run(argv) {
    }

};



