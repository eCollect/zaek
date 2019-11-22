'use strict';

const EventEmitter = require('events');

const uuid = require('uuid/v4');

const REPLY_QUEUE = 'amq.rabbitmq.reply-to'; // direct reply-to

class RpcClient {
	constructor(channel, name, options = {}) {
		this.channel = channel;
		this.name = name;

		this.options = options;

		this.emitter = new EventEmitter();
		this.emitter = this.emitter.setMaxListeners(0);

		this.channel.consume(REPLY_QUEUE,
			msg => this.emitter.emit(msg.properties.correlationId, JSON.parse(msg.content.toString('utf8'))),
			{ noAck: true });
	}

	async ask(body, options = {}) {
		const correlationId = uuid();
		const messageOptions = {
			...this.options,
			...options,
		};
		return new Promise((resolve, reject) => {
			setTimeout((e) => {
				this.emitter.removeListener(correlationId, resolve);
				reject(e);
			}, 100, new Error('Request timed out.'));

			this.emitter.once(correlationId, resolve);

			this.channel.publish(
				this.name,
				options.routingKey || '',
				Buffer.from(JSON.stringify(body), 'utf8'),
				{
					...messageOptions,
					replyTo: 'amq.rabbitmq.reply-to',
					correlationId,
				},
			);
		});
	}
}

module.exports = RpcClient;
