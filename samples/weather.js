
var WeatherService = require('../src/weather-service.js');
var MatrixCommand = require('../src/matrix-command.js');

module.exports = class WeatherCommand extends MatrixCommand {

    constructor(options) {
        super({command: 'weather [options]', description: 'Display weather', ...options}); 
    }

    options(args) {
        super.options(args);
		args.option('textColor', {describe:'Text color', default:'red'});
    }
    
    getService() {
        this.debug(this.argv);
        return WeatherService;
    }


};



