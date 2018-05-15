'use strict';

const zaek = require('../lib/index');

async function run() {
	const broker = await zaek.connect({
		user: 'guest',
		pass: 'guest',
		server: ['127.0.0.1'],
		port: 5672,
		publishTimeout: 100,
		timeout: 1000,
		failAfter: 30,
		retryLimit: 400,
	});

	broker.once('error', err => {
		console.log(err);
	});


	const stream = await broker.publisher('test:zaek:event-2', true).createReadStream('test-app');

	stream.on('data', (message) => {
		console.log('recived :', message.body);
		message.ack();
	});
}

run();
