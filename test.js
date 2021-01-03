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
				textColor: 'red'
			};
			
			socket.emit('news', options);
		});
		socket.on('disconnect', () => {
			console.log('disconnected');
		});

		console.log('Done');


	};

};


var app = new App();
app.run();