
module.exports = class {

    constructor(options) {
        var {debug, ...options} = options;
        this.debug = typeof debug === 'function' ? debug : (debug ? console.log : () => {});
    }


    fetch() {
        var sprintf = require('yow/sprintf');
        var Request = require('yow/request');

        return new Promise((resolve, reject) => {
            var request = new Request('http://api.openweathermap.org');
    
            var query = {};
            query.appid   = process.env.OPENWEATHERMAP_APPID;
            query.lat     = 55.71;
            query.lon     = 13.19;
            query.exclude = 'minutely,hourly';
            query.units   = 'metric';
            query.lang    = 'se';
    
            request.get('/data/2.5/onecall', {query:query}).then((response) => {
                response.body.current.dt = new Date(response.body.current.dt * 1000);
                response.body.current.sunset = new Date(response.body.current.sunset * 1000);
                response.body.current.sunrise = new Date(response.body.current.sunrise * 1000);

                var current  = response.body.current;
                var tomorrow = response.body.daily[1];

                var texts = [];
                texts.push(sprintf('Just nu %d° och %s', Math.round(current.temp + 0.5), current.weather[0].description));
                texts.push(sprintf('I morgon %d° (%d°) och %s', Math.round(tomorrow.temp.max + 0.5), Math.round(tomorrow.temp.min + 0.5), tomorrow.weather[0].description));



                response.body.daily.forEach(element => {
                    element.dt = new Date(element.dt * 1000);
                    element.sunset = new Date(element.sunset * 1000);
                    element.sunrise = new Date(element.sunrise * 1000);
                });

//                console.log(JSON.stringify(current, null, '    '));
  //              console.log(JSON.stringify(tomorrow, null, '    '));

                resolve(texts);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
 
    


};


