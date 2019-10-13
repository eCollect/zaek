'use strict';

const amqp = require('amqplib');

const Broker = require('./Broker');

const zaek = {
	async connect(connectionOptions) {
		if (!connectionOptions)
			throw new Error('No connectionOptions supplied.');

		let connection;

		try {
			connection = await amqp.connect(connectionOptions, {});
		} catch (ex) {
			throw new Error('Could not connect to RabbitMQ.');
		}

		return new Broker(connection);
	},
};

module.exports = zaek;
