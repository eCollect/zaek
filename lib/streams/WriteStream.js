'use strict';

const EventEmitter = require('events');
const { Writable } = require('stream');

const uuid = require('uuid/v4');

const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

class WriteStream extends Writable {
	constructor(channel, name, options = {}) {
		super({ objectMode: true });

		this.channel = channel;
		this.name = name;
		this.options = options;

		this.channel.responseEmitter = new EventEmitter();
		this.channel.responseEmitter.setMaxListeners(0);
		this.channel.consume(REPLY_QUEUE,
			(msg) => {
				console.log('answer', msg);
				channel.responseEmitter.emit(msg.properties.correlationId, JSON.parse(msg.content.toString('utf8')))
			},
			{ noAck: true });
	}

	_write(chunk, encoding, callback) {
		this.channel.publish(
			this.name,
			chunk.routingKey || '',
			Buffer.from(JSON.stringify(chunk.body), 'utf8'),
			{
				...this.options,
				replyTo: 'amq.rabbitmq.reply-to',
				correlationId: uuid(),
			},
		);
		callback(null);
	}
}

module.exports = WriteStream;
