

module.exports = class Command {

    constructor(module, options) {
        var {command, description} = options;

        module.exports.command  = command;
        module.exports.describe = description;
        module.exports.builder  = this.builder.bind(this);
        module.exports.handler  = this.handler.bind(this);

        this.debug = console.log;

    }

    defineOptions(args) {
    }
 
    handler(args) {

        args.usage('Usage: $0 [options]');

        args.option('help', {describe:'Displays this information'});
        args.option('debug', {describe:'Debug mode', default:undefined});

        this.defineOptions(args);

        args.wrap(null);

        args.check(function(argv) {
            return true;
        });

        return args.argv;
    }
    
    
    builder(argv) {
        this.argv = argv;
        this.run(argv);
    }


    


};



