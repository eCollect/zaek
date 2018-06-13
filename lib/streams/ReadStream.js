'use strict';

const { Transform } = require('stream');

module.exports = class ReadStream extends Transform {
	constructor(channel, queues) {
		super({ objectMode: true });
		this.channel = channel;
		const handler = message => this.write(message);
		queues.forEach(queue => this.channel.consume(queue, handler));
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
