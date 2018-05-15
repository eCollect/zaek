'use strict';

const { PassThrough } = require('stream');

const WriteStream = require('./WriteStream');

// Command Publisher ( Domain )
class Publisher {
	constructor(rabbit, name, persistent) {
		this.rabbit = rabbit;
		this.name = name;
		this.persistent = persistent;
	}

	async createWriteStream(options = {}) {
		await this.rabbit.addExchange(this.name, 'fanout', {
			persistent: this.persistent,
			autoDelete: false,
			durable: true,
			publishTimeout: options.publishTimeout,
		});

		return new WriteStream(this.rabbit, this.name, this.persistent);
	}

	// service name ie: readmodels-service
	async createReadStream(serviceName) {
		await this.rabbit.addExchange(this.name, 'fanout', {
			persistent: this.persistent,
			autoDelete: false,
			durable: true,
		});

		serviceName = serviceName.replace('.', ':');
		const queueName = `${this.name}:${serviceName}`;
		await this.rabbit.addQueue(queueName, { autoDelete: !this.persistent, durable: !this.persistent });
		await this.rabbit.bindQueue(this.name, queueName, []);

		const readStream = new PassThrough({ objectMode: true });

		this.rabbit.handle('*', (message) => {
			const parsedMessage = {
				headers: message.headers,
				body: message.body,
				reject() {
					message.reject();
				},
				nack() {
					message.nack();
				},
				ack() {
					message.ack();
				},
			};

			readStream.write(parsedMessage);
		});

		await this.rabbit.startSubscription(queueName);

		return readStream;
	}
}

module.exports = Publisher;
