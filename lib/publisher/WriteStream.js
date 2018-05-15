'use strict';

const { Writable } = require('stream');

class WriteStream extends Writable {
	constructor(rabbit, name, persistent) {
		super({ objectMode: true });

		this.rabbit = rabbit;
		this.name = name;
		this.persistent = persistent;
	}

	_write(chunk, encoding, callback) {
		// rabbot type fix
		if (!chunk.type)
			chunk.type = 'zaek:publish';
		if (this.persistent)
			chunk.persistent = this.persistent;
		this.rabbit.publish(this.name, chunk).then(callback).catch(callback);
	}
}

module.exports = WriteStream;
