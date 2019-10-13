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


	const stream = await broker.worker('test:zaek:worker').createWriteStream('commands');
	stream.on('error', onError);

	for (let i = 0; i < 100; i++)
		stream.write({
			body: { i },
		});


	stream.end(async () => {
		await broker.close();
	});

	// stream.end(err => process.exit(err ? 1 : 0));

	// process.exit(0);
}

run();
