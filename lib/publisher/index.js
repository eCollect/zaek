'use strict';

const WriteStream = require('../streams/WriteStream');
const ReadStream = require('../streams/ReadStream');

// Command Publisher ( Domain )
class Publisher {
	constructor({ publishChannel, consumeChannel }, name) {
		this.publishChannel = publishChannel;
		this.consumeChannel = consumeChannel;

		this.name = name;
	}

	async createWriteStream(type) {
		await this._assertExchange();
		return new WriteStream(this.publishChannel, this.name, { persistant: true, type });
	}

	// service name ie: readmodels-service
	async createReadStream(serviceName, { persistent = false, bindingKey = '#' }) {
		await this._assertExchange();

		serviceName = serviceName.replace('.', ':');
		const queueName = `${this.name}:${serviceName}`;
		await this.consumeChannel.assertQueue(queueName, { autoDelete: !persistent, durable: !persistent });
		await this.consumeChannel.bindQueue(queueName, this.name, bindingKey, {});

		return new ReadStream(this.consumeChannel, [queueName]);
	}

	_assertExchange() {
		return this.publishChannel.assertExchange(this.name, 'topic', {
			autoDelete: false,
			durable: true,
		});
	}
}

module.exports = Publisher;
