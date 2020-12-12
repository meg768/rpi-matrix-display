

module.exports = class Command {

    constructor(foo, options) {
        var {command, description} = options;

        var builder = (argv) => {
            this.argv = argv;
            console.log('BUILDERRRRR ARRRRGGHHHSS', argv);
            this.run(argv);

        };

        var handler = (args) => {
            this.args = args;
            console.log('ARRRRGGHHHSS', args);

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

        foo.exports.command  = command;
        foo.exports.describe = description;
        foo.exports.builder  = builder;
        foo.exports.handler  = handler;

        this.debug = console.log;

    }



};



