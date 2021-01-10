#!/usr/bin/env node

require('dotenv').config();

var mqtt = require('mqtt');
var client  = mqtt.connect(process.env.MQTT_HOST, {username:process.env.MQTT_USERNAME, password:process.env.MQTT_PASSWORD});


client.on('connect',  () => {

	console.log('Connected!');

	client.subscribe('homey/devices/utomhus/terassen/onoff',  (err) => {
		console.log('Subscribed!');
	})

	client.on('message', (topic, message, packet) => {
		console.log('topic', topic);
		console.log('message', message.toString());
		console.log('packet', packet);
		console.log('value', eval(message.toString()));
	});

/*
	client.publish('homey/devices/utomhus/terassen/onoff', 'true');
	client.end();
	*/
})



console.log('Done.');