'use strict';

const { EventEmitter } = require('events');

const Publisher = require('./publisher');
const Worker = require('./worker');
const ChannelSupplier = require('./ChannelSupplier');

class Broker extends EventEmitter {
	constructor(connection) {
		super();

		this.connection = connection;
		// per rabbitmq specifications channels should be uni-directional
		// this.publishChannel = publishChannel;
		// this.consumeChannel = consumeChannel;
		this.publishChannelSupplier = new ChannelSupplier(connection);
		this.consumeChannelSupplier = new ChannelSupplier(connection);

		let onClose;
		let onError;

		const unsubscribe = () => {
			this.connection.removeListener('closed', onClose);
			this.connection.removeListener('error', onError);
			this.publishChannelSupplier.removeListeners();
			this.consumeChannelSupplier.removeListeners();
			// this.publishChannel.removeListener('closed', onClose);
			// this.publishChannel.removeListener('error', onError);
			// this.consumeChannel.removeListener('closed', onClose);
			// this.consumeChannel.removeListener('error', onError);
		};

		onClose = () => {
			unsubscribe();
			this.emit('disconnect');
		};

		onError = (err) => {
			unsubscribe();
			this.emit('disconnect', err);
		};

		this.consumeChannelSupplier.bindHandlers(onClose, onError);
		this.publishChannelSupplier.bindHandlers(onClose, onError);
		this.connection.on('close', onClose);
		this.connection.on('error', onError);
		// this.publishChannel.on('close', onClose);
		// this.publishChannel.on('error', onError);
		// this.consumeChannel.on('close', onClose);
		// this.consumeChannel.on('error', onError);
	}

	worker(name) {
		if (!name) throw new Error('Name is missing.');

		return new Worker(
			{
				publishChannelSupplier: this.publishChannelSupplier,
				consumeChannelSupplier: this.consumeChannelSupplier,
			},
			name,
		);
	}

	publisher(name, persistent = false) {
		if (!name) throw new Error('Name is missing.');

		return new Publisher(
			{
				publishChannelSupplier: this.publishChannelSupplier,
				consumeChannelSupplier: this.consumeChannelSupplier,
			},
			name,
			persistent,
		);
	}

	async close() {
		this.connection.removeAllListeners();
		// this.publishChannel.removeAllListeners();
		// this.consumeChannel.removeAllListeners();
		await this.publishChannelSupplier.close();
		await this.consumeChannelSupplier.close();
		// await this.publishChannel.close();
		// await this.consumeChannel.close();
		await this.connection.close();
	}
}

module.exports = Broker;
