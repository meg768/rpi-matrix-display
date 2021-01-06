#!/usr/bin/env node

var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://85.24.185.150');

		
client.on('message', (topic, message) => {
	console.log('Got message');
	// message is Buffer
	console.log('topic', topic)
	console.log('message', message.toString());
	client.end();
});


console.log('Done.');