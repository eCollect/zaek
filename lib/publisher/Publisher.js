'use strict';

const WriteStream = require('../streams/WriteStream');
const ReadStream = require('../streams/ReadStream');

// Command Publisher ( Domain )
class Publisher {
	constructor({ publishChannel, consumeChannel }, name, {
		autoDelete = false,
		durable = true,
	} = {}) {
		this.publishChannel = publishChannel;
		this.consumeChannel = consumeChannel;

		this.name = name;

		this.autoDelete = autoDelete;
		this.durable = durable;
	}

	async createWriteStream(type) {
		const channel = await this.publishChannelSupplier.getChannel();
		await this._assertExchange(channel);
		return new WriteStream(channel, this.name, { persistant: true, type });
	}

	// service name ie: readmodels-service
	async createReadStream(
		serviceName, {
			persistent = false,
			bindingKey = '#',
			noAck = false,
			prefetch = 1,
		},
	) {
		const channel = await this.consumeChannelSupplier.getChannel();
		await this._assertExchange(channel);

		serviceName = serviceName.replace('.', ':');
		const queueName = `${this.name}:${serviceName}`;
		await channel.assertQueue(queueName, { autoDelete: !persistent, durable: persistent });
		await channel.bindQueue(queueName, this.name, bindingKey, {});

		return new ReadStream(channel, { prefetch }).consume([queueName], { noAck });
	}


	// clearWrite clears only the exchange
	async clearWrite() {
		const channel = await this.publishChannelSupplier.getChannel();
		return channel.deleteExchange(this.name);
	}

	// clearRead clears only the queues
	async clearRead(serviceName) {
		const channel = await this.consumeChannelSupplier.getChannel();
		const queueName = `${this.name}:${serviceName}`;
		return channel.deleteQueue(queueName);
	}

	_assertExchange(channel) {
		return channel.assertExchange(this.name, 'topic', {
			autoDelete: this.autoDelete,
			durable: this.durable,
		});
	}
}

module.exports = Publisher;
