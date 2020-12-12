var sprintf = require('yow/sprintf');

module.exports = class Command {

    constructor(foo, options) {
        var {name, description} = options;

        var builder = (argv) => {
            console.log('BUILDERRRRR ARRRRGGHHHSS', argv);
            this.argv = argv;
            this.run(argv);

        };

        var handler = (args) => {
            console.log('ARRRRGGHHHSS', args);
            this.args = args;

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

        foo.exports.command  = sprintf('%s [options]', name); 
        foo.exports.describe = description;
        foo.exports.builder  = builder;
        foo.exports.handler  = handler;

        this.debug = console.log;

    }



};



