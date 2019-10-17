'use strict';

const { Transform } = require('stream');

module.exports = class ReadStream extends Transform {
	constructor(channel, { prefetch }) {
		super({ objectMode: true });
		this.channel = channel;
		this.prefetch = prefetch;
		this.consumerTag = null;
	}

	async consume(queue, options) {
		const handler = message => this.write(message);
		this.consumerTag = await this.channel.prefetchConsume(this.prefetch, queue, handler, options);
		return this;
	}

	_transform(message, encoding, callback) {
		const normalizedMessage = {
			type: message.properties.type,
			routingKey: message.fields.routingKey,
			body: JSON.parse(message.content.toString('utf8')),
			reject: () => this.channel.nack(message, false, false),
			nack: () => this.channel.nack(message, false, true),
			ack: () => this.channel.ack(message),
		};
		if (message.properties.replyTo)
			normalizedMessage.reply = payload => this.channel.sendToQueue(message.properties.replyTo, Buffer.from(JSON.stringify(payload), 'utf8'), { correlationId: message.properties.correlationId });

		this.push(normalizedMessage);
		callback(null);
	}

	_final(done) {
		this.channel.cancel(this.consumerTag.consumerTag, done);
	}
};
