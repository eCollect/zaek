'use strict';

const { Transform } = require('stream');

module.exports = class ReadStream extends Transform {
	constructor(channel) {
		super({ objectMode: true });
		this.channel = channel;
		this.consumerTags = [];
	}

	async consume(queues, options) {
		const handler = message => this.write(message);
		this.consumerTags = await Promise.all(queues.map(queue => this.channel.consume(queue, handler, options)));
		return this;
	}

	_write(message, encoding, callback) {
		this.push({
			type: message.properties.type,
			routingKey: message.fields.routingKey,
			body: JSON.parse(message.content.toString('utf8')),
			reject: () => this.channel.nack(message, false, false),
			nack: () => this.channel.nack(message, false, true),
			ack: () => this.channel.ack(message),
		});
		callback(null);
	}

};
