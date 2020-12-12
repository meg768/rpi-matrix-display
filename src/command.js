

module.exports = class Command {

    constructor(module, options) {
        var {command, description} = options;

        var builder = (argv) => {
            this.argv = argv;
            this.run(argv);

        };

        var handler = (args) => {
            args.usage('Usage: $0 [options]');

            args.option('help', {describe:'Displays this information'});
            args.option('debug', {describe:'Debug mode', default:undefined});
    
            this.defineOptions(args);
    
            args.wrap(null);
    
            args.check(function(argv) {
                return true;
            });
    
            return args.argv;

        };

        module.exports.command  = command;
        module.exports.describe = description;
        module.exports.builder  = builder.bind(this);
        module.exports.handler  = handler.bind(this);

        this.debug = console.log;

    }



};



