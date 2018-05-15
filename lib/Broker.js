'use strict';

const { EventEmitter } = require('events');

const Publisher = require('./publisher');
const Worker = require('./worker');

class Broker extends EventEmitter {
	constructor(rabbot, connection) {
		super();

		this.rabbot = rabbot;
		this.connection = connection;

		let onClose;
		let onError;

		const unsubscribe = () => {
			this.rabbot.removeListener('closed', onClose);
			this.rabbot.removeListener('error', onError);
		};

		onClose = () => {
			unsubscribe();
			this.emit('disconnect');
		};

		onError = () => {
			unsubscribe();
			this.emit('disconnect');
		};

		this.rabbot.on('closed', onClose);
		this.rabbot.on('failed', onError);
	}

	worker(name) {
		if (!name) throw new Error('Name is missing.');

		return new Worker(this.rabbot, name);
	}

	publisher(name, persistent = false) {
		if (!name) throw new Error('Name is missing.');

		return new Publisher(this.rabbot, name, persistent);
	}
}

module.exports = Broker;
