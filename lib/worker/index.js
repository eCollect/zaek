'use strict';

const { PassThrough } = require('stream');

const WriteStream = require('./WriteStream');

// Command Worker ( Domain )
class Worker {
	constructor(rabbit, name) {
		this.rabbit = rabbit;
		this.name = name;
	}

	async createWriteStream(options = {}) {
		await this.rabbit.addExchange(this.name, 'direct', {
			publishTimeout: options.publishTimeout,
		});

		return new WriteStream(this.rabbit, this.name);
	}

	// aggregates = list of aggregates including context ( ie: accountig.payment )
	async createReadStream(aggregates = []) {
		await this.rabbit.addExchange(this.name, 'direct', {
			autoDelete: false,
		});

		const queueNames = await Promise.all(aggregates.map(async (a) => {
			a = a.replace('.', ':');
			const queueName = `${this.name}:${a}`;
			await this.rabbit.addQueue(queueName, { autoDelete: true });
			await this.rabbit.bindQueue(this.name, queueName, [a]);
			return queueName;
		}));

		const readStream = new PassThrough({ objectMode: true });

		this.rabbit.handle('*', (message) => {
			const parsedMessage = {
				body: message.body,
				reject() {
					message.reject();
				},
				nack() {
					message.nack();
				},
				ack() {
					message.reply({});
				},
				reply(reply = {}) {
					message.reply(reply);
				},
			};

			readStream.write(parsedMessage);
		});

		await Promise.all(queueNames.map(q => this.rabbit.startSubscription(q)));

		return readStream;
	}
}

module.exports = Worker;
