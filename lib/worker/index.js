'use strict';

const WriteStream = require('../streams/WriteStream');
const ReadStream = require('../streams/ReadStream');

// Command Worker ( Domain )
class Worker {
	constructor({ publishChannel, consumeChannel }, name) {
		this.publishChannel = publishChannel;
		this.consumeChannel = consumeChannel;

		this.name = name;
	}

	async createWriteStream(type) {
		await this._assertExchange();
		return new WriteStream(this.publishChannel, this.name, { persistant: false, type });
	}

	// aggregates = list of aggregates including context ( ie: accountig.payment )
	async createReadStream() {
		await this._assertExchange();

		const queueName = `${this.name}:commands`; // dots are unwanted in queue names
		await this.consumeChannel.assertQueue(queueName, { autoDelete: true });
		await this.consumeChannel.bindQueue(queueName, this.name, 'command', {});

		return new ReadStream(this.consumeChannel, [ queueName ]);
	}


	// clearWrite clears only the exchange
	async clearWrite() {
		return this.publishChannel.deleteExchange(this.name);
	}


	// clearRead clears only the queues
	async clearRead() {
		const queueName = `${this.name}:commands`; // dots are unwanted in queue names
		return this.consumeChannel.deleteQueue(queueName);
	}

	_assertExchange() {
		return this.publishChannel.assertExchange(this.name, 'direct', {
			autoDelete: false,
		});
	}
}

module.exports = Worker;
