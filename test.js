#!/usr/bin/env node




class App {

	constructor() {

	}




	run() {
		var io = require('socket.io-client');
		var socket = io('http://pi-matrix-64x64:3987');

		socket.on('connect', () => {
			console.log('connected');
			var options = {
				priority: '!',
				duration: 5000,
				fontSize: 0.5,
				scrollDelay: 7,
				textColor: 'green'
			};

			socket.emit('animate', 'news', options, (promise) => {
				promise.then((args) => {
					console.log('Resolved:', JSON.stringify(args));
				})
				.catch((error) => {
					console.log('Rejected', error);

				})
			});
		});
		socket.on('disconnect', () => {
			console.log('disconnected');
		});

		console.log('Done');


	};

};


var app = new App();
app.run();