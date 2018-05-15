'use strict';

// const amqp = require('amqplib');
const rabbot = require('rabbot');

const Broker = require('./Broker');

const zaek = {
	async connect(options) {
		if (!options)
			throw new Error('No options supplied.');

		let connection;

		try {
			connection = await rabbot.addConnection(options);
		} catch (ex) {
			throw new Error('Could not connect to RabbitMQ.');
		}

		return new Broker(rabbot, connection);
	},
};

module.exports = zaek;
