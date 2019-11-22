'use strict';

/* eslint-disable no-console */

const zaek = require('../../lib/index');

class EndAwaitor {
	constructor() {
		this._resolve = null;
		this._promise = new Promise((resolve) => {
			this._resolve = resolve;
		});
	}

	async await() {
		return this._promise;
	}

	end() {
		this._resolve();
	}
}

async function run() {
	const broker = await zaek.connect({
		user: 'guest',
		pass: 'guest',
		username: 'guest',
		password: 'guest',
		server: ['127.0.0.1'],
		port: 5672,
		hostname: 'localhost',
	});

	const onError = (err) => {
		console.error(err);
		process.exit(1);
	};

	broker.once('error', onError);

	const readStream = await broker.rpc('test:zaek:rpc').createReadStream({ prefetch: 1 });
	readStream.on('error', onError);

	const endAwaitor = new EndAwaitor();

	readStream.on('data', (message) => {
		message.reply('hi');
		if (!message.body) {
			message.ack();
			return endAwaitor.end();
		}

		console.log(`---[work received wid: ${message.body.i}  pid: ${process.pid}]----`);
		console.log(message);
		return setTimeout(() => message.ack(), Math.random() * 10); // simulate work
	});

	const rpcClient = await broker.rpc('test:zaek:rpc').createClient();


	console.log(await rpcClient.ask('hello'));

	/*
	writeStream.end(async () => {
		await broker.close();
	});
	*/

	await endAwaitor.await();
	process.exit(0);

	// stream.end(err => process.exit(err ? 1 : 0));

	// process.exit(0);
}

run();
