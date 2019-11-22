'use strict';

const RpcClient = require('../streams/RpcClient');
const ReadStream = require('../streams/ReadStream');

// Command Worker ( Domain )
class RPC {
	constructor({ publishChannelSupplier, consumeChannelSupplier }, name, {
		autoDelete = false,
		durable = true,
	} = {}) {
		this.publishChannelSupplier = publishChannelSupplier;
		this.consumeChannelSupplier = consumeChannelSupplier;

		this.name = name;

		this.autoDelete = autoDelete;
		this.durable = durable;
	}

	async createClient({ timeout } = {}) {
		const channel = await this.publishChannelSupplier.getChannel();
		await this._assertExchange(channel);
		return new RpcClient(channel, this.name, {
			persistant: false,
			timeout,
		});
	}


	async createReadStream({
		persistent = false,
		prefetch = 1,
		bindingKey = '',
		queueName = this.name,
	} = {}) {
		const channel = await this.consumeChannelSupplier.getChannel();
		await this._assertExchange(channel);

		await channel.assertQueue(queueName, { autoDelete: !persistent, durable: persistent });
		await channel.bindQueue(
			queueName,
			this.name,
			bindingKey,
			{},
		);

		return new ReadStream(channel, { prefetch }).consume(queueName, {});
	}

	// clearWrite clears only the exchange
	async clearWrite() {
		const channel = await this.publishChannelSupplier.getChannel();
		return channel.deleteExchange(this.name);
	}

	// clearRead clears only the queues
	async clearRead() {
		const channel = await this.consumeChannelSupplier.getChannel();
		const queueName = this.name; // dots are unwanted in queue names
		return channel.deleteQueue(queueName);
	}

	async clear() {
		await this.clearRead();
		await this.clearWrite();
	}

	_assertExchange(channel) {
		return channel.assertExchange(this.name, 'direct', {
			autoDelete: this.autoDelete,
			durable: this.durable,
		});
	}
}

module.exports = RPC;
