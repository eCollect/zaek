'use strict';

/* eslint-disable no-console */

const zaek = require('../../lib/index');

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


	const stream = await broker.worker('test:zaek:worker').createReadStream({});
	stream.on('error', onError);

	stream.on('data', (message) => {
		console.log(`---[work received ${process.pid}]----`);
		console.log(message);
		setTimeout(() => message.ack());
	});
}

run();
