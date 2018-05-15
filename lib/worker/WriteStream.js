'use strict';

const { Writable } = require('stream');

class WriteStream extends Writable {
	constructor(rabbit, name) {
		super({ objectMode: true });

		this.rabbit = rabbit;
		this.name = name;
	}

	_write(chunk, encoding, callback) {
		this.rabbit.request(this.name, chunk).then(callback).catch(callback);
	}
}

module.exports = WriteStream;
