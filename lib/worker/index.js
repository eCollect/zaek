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
	async createReadStream(aggregates = []) {
		await this._assertExchange();
		const queueNames = await Promise.all(aggregates.map(async (a) => {
			a = a.replace('.', ':');
			const queueName = `${this.name}:${a}`;
			await this.consumeChannel.assertQueue(queueName, { autoDelete: true });
			await this.consumeChannel.bindQueue(queueName, this.name, a, {});
			return queueName;
		}));

		return new ReadStream(this.consumeChannel, queueNames);
	}

	_assertExchange() {
		return this.publishChannel.assertExchange(this.name, 'direct', {
			autoDelete: false,
		});
	}
}

module.exports = Worker;
