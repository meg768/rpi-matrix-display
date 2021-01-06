#!/usr/bin/env node

var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://85.24.185.150');


client.on('connect',  () => {
	var json = {
		priority: '!',
		iterations: 1,
		fontSize: 0.5,
		text: 'Hej Magnus',
	};
	client.publish('news', JSON.stringify(json));
	client.end();
})

/*

client.on('connect',  () => {
	console.log('Connected!');
	client.subscribe('test',  (err) => {
		console.log('Subscribed!');
	})
})

client.on('message', (topic, message) => {
	// message is Buffer
	console.log('topic', topic)
	console.log('message', message.toString());
});
*/

console.log('Done.');