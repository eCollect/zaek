'use strict';

const { EventEmitter } = require('events');

const Publisher = require('./publisher');
const Worker = require('./worker');

class Broker extends EventEmitter {
	constructor(connection, { publishChannel, consumeChannel }) {
		super();

		this.connection = connection;
		// per rabbitmq specifications channels should be uni-directional
		this.publishChannel = publishChannel;
		this.consumeChannel = consumeChannel;

		let onClose;
		let onError;

		const unsubscribe = () => {
			this.connection.removeListener('closed', onClose);
			this.connection.removeListener('error', onError);
			this.publishChannel.removeListener('closed', onClose);
			this.publishChannel.removeListener('error', onError);
			this.consumeChannel.removeListener('closed', onClose);
			this.consumeChannel.removeListener('error', onError);
		};

		onClose = () => {
			unsubscribe();
			this.emit('disconnect');
		};

		onError = () => {
			unsubscribe();
			this.emit('disconnect');
		};

		this.connection.on('close', onClose);
		this.connection.on('error', onError);
		this.publishChannel.on('close', onClose);
		this.publishChannel.on('error', onError);
		this.consumeChannel.on('close', onClose);
		this.consumeChannel.on('error', onError);
	}

	worker(name) {
		if (!name) throw new Error('Name is missing.');

		return new Worker({
			publishChannel: this.publishChannel,
			consumeChannel: this.consumeChannel,
		}, name);
	}

	publisher(name, persistent = false) {
		if (!name) throw new Error('Name is missing.');

		return new Publisher({
			publishChannel: this.publishChannel,
			consumeChannel: this.consumeChannel,
		}, name, persistent);
	}
}

module.exports = Broker;
