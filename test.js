#!/usr/bin/env node

var io = require('socket.io-client');
var socket = io('http://85.24.185.150:3987');

socket.on('connect', () => {
	var options = {
		text: 'Hello World',
		priority: '!',
		duration: 5000,
		fontSize: 0.5,
		scrollDelay: 6,
		textColor: 'green'
	};

	socket.emit('animate', 'text', options, (response) => {
		console.log(response);
	});
});
