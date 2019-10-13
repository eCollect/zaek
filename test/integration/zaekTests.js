'use strict';

/* eslint-env node, mocha */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const { expect } = chai;

chai.use(chaiAsPromised);

const zaek = require('../../lib');

const connectionOptions = {
	user: 'guest',
	pass: 'guest',
	username: 'guest',
	password: 'guest',
	server: ['127.0.0.1'],
	port: 5672,
	hostname: 'localhost',
};


describe('zaek', async () => {
	describe('connect', async () => {
		it('should throw when no connectionOptions are provided', async () => {
			await expect(zaek.connect()).to.be.rejected;
		});

		it('should connect and close connection', async () => {
			const broker = await zaek.connect(connectionOptions, 1);
			await broker.close();
		});
	});

	describe('worker communication', async () => {
		let broker;
		let worker;
		let consumerStream;
		let producerStream;

		before(async () => {
			broker = await zaek.connect(connectionOptions, 1);
		});

		after(async () => {
			await worker.clearWrite();
			await broker.close();
		});

		it('should create worker', async () => {
			worker = broker.worker('zaek-worker-tests');
		});

		it('should create consumerStream', async () => {
			consumerStream = await worker.createReadStream();
		});

		it('should create producerStream', async () => {
			producerStream = await worker.createWriteStream('tests');
		});

		it('should produce a message', async () => {
			producerStream.write({
				body: {
					zaek: 'is-testing',
					i: 0,
					id: process.pid,
				},
			});
			producerStream.write({
				body: {
					zaek: 'is-testing',
					i: 1,
					id: process.pid,
				},
			});
			producerStream.write({
				body: {
					end: true,
					i: 2,
					id: process.pid,
				},
			});
		});

		it('should consume a messages in order', (done) => {
			let messagesCount = 0;
			consumerStream.on('data', (message) => {
				const { body } = message;
				if (body.id !== process.pid)
					return message.ack();
				messagesCount += 1;
				if (!body.end)
					return message.ack();
				done((messagesCount !== 3 && body.i !== 2) ? new Error('wrong message sequenece or number') : null);
				return message.ack();
			});
		});
	});

	describe('publisher communication', async () => {
		let broker;
		let publisher;
		let consumerStream;
		let producerStream;

		before(async () => {
			broker = await zaek.connect(connectionOptions, 1);
		});

		after(async () => {
			await publisher.clearWrite();
			await publisher.clearRead();
			await broker.close();
		});

		it('should create worker', async () => {
			publisher = broker.publisher('zaek-pub-tests', false);
		});

		it('should create consumerStream', async () => {
			consumerStream = await publisher.createReadStream('pub-sub');
		});

		it('should create producerStream', async () => {
			producerStream = await publisher.createWriteStream('pub-sub');
		});

		it('should produce a message', async () => {
			producerStream.write({
				body: {
					zaek: 'is-testing',
					i: 0,
					id: process.pid,
				},
			});
			producerStream.write({
				body: {
					zaek: 'is-testing',
					i: 1,
					id: process.pid,
				},
			});
			producerStream.write({
				body: {
					end: true,
					i: 2,
					id: process.pid,
				},
			});
		});

		it('should consume a messages in order', (done) => {
			let messagesCount = 0;
			consumerStream.on('data', (message) => {
				const { body } = message;
				if (body.id !== process.pid)
					return message.ack();
				messagesCount += 1;
				if (!body.end)
					return message.ack();
				done((messagesCount !== 3 && body.i !== 2) ? new Error('wrong message sequenece or number') : null);
				return message.ack();
			});
		});
	});

});
