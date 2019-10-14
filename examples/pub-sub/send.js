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

	const stream = await broker.publisher('test:zaek:command:154').createWriteStream('typed');
	return stream;
	// await stream.write({ hello: 'world' }).catch(e => console.log(e));
}


run().then((s) => {
	s.write({
		routingKey: 'mitko.pesho',
		body: { hi: 'yjere' },
	});
	/*
	for (let i = 0; i < 100000; i++)
		s.write({
			body: i,
		});
	*/
});
