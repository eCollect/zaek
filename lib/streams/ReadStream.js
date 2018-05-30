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
			body: JSON.parse(message.content.toString('utf8')),
			nack: () => this.channel.nack(message, false, false),
			ack: () => this.channel.ack(message),
		});
		callback(null);
	}
};
