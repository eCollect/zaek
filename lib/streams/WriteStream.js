'use strict';

const { Writable } = require('stream');

class WriteStream extends Writable {
	constructor(channel, name, options = {}) {
		super({ objectMode: true });

		this.channel = channel;
		this.name = name;
		this.options = options;
	}

	_write(chunk, encoding, callback) {
		this.channel.publish(this.name, chunk.routingKey, Buffer.from(JSON.stringify(chunk.body), 'utf8'), this.options);
		callback(null);
	}
}

module.exports = WriteStream;
