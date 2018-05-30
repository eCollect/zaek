'use strict';

const zaek = require('../lib/index');

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

	broker.once('error', err => {
		console.log(err);
	});


	const stream = await broker.worker('test:zaek:command:152').createReadStream(['mitko:mitko']);
	console.log(stream);

	stream.on('data', (message) => {
		console.log(message);
		message.ack();
	});

	stream.on('error', (e) => console.error(e));
}

run();
