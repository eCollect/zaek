'use strict';

module.exports = class ChannelSupplier {
	constructor(connection, onClose, onError) {
		this._connection = connection;
		this._channelInitilizer = null;
		this._channel = null;
		this._executing = false;
		this._requestQueue = [];

		this._onClose = onClose;
		this._onError = onError;
	}

	async getChannel() {
		if (!this._channel)
			this._channel = await this._intilizeChannel();
		this._channel.on('error', this._onError);
		this._channel.on('close', this._onClose);
		this._channel.prefetchConsume = (prefetch, queue, handler, options) => this.consume(prefetch, queue, handler, options);
		return this._channel;
	}

	async consume(prefetch, queue, handler, options) {
		const promise = new Promise((resolve, reject) => this._requestQueue.push(() => this._consume(prefetch, queue, handler, options).then(resolve, reject)));
		this._execute();
		return promise;
	}

	bindHandlers(onClose, onError) {
		this._onError = onError;
		this._onClose = onClose;
	}

	removeListeners() {
		if (!this._channel)
			return;
		this._channel.removeListener('error', this._onError);
		this._channel.removeListener('close', this._onClose);
	}

	async _intilizeChannel() {
		if (!this._channelInitilizer)
			this._channelInitilizer = (async () => {
				this._channel = await this._connection.createChannel();
				this._channel.on('error', this._onError);
				this._channel.on('close', this._onClose);
				this._channel.prefetchConsume = (prefetch, queue, handler, options) => this.consume(prefetch, queue, handler, options);
				return this._channel;
			})();
		return this._channelInitilizer;
	}

	async _consume(prefetch, queue, handler, options) {
		if (!this._channel)
			throw new Error('Channel not initilized.');
		this._channel.prefetch(prefetch);
		return this._channel.consume(queue, handler, options);
	}

	async _execute() {
		if (this._executing) return;
		this._executing = true;
		while (this._requestQueue.length > 0) {
			const action = this._requestQueue.shift();
			await action();
		}
		this._executing = false;
	}
};
