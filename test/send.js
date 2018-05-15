'use strict';

const zaek = require('../lib/index');

async function run() {
	// const broker = await zaek.connect('amqp://guest:guest@localhost:5672');
	const broker = await zaek.connect({
		user: 'guest',
		pass: 'guest',
		server: ['127.0.0.1'],
		port: 5672,
		publishTimeout: 1000,
		timeout: 1000,
		failAfter: 30,
		retryLimit: 400,
	});
	const stream = await broker.publisher('test:zaek:event-2', true).createWriteStream({
		publishTimeout: 1000,
	});
	return stream;
	// await stream.write({ hello: 'world' }).catch(e => console.log(e));
}

run().then((s) => {
	for (let i = 0; i < 100000; i++)
		s.write({
			body: i,
		});
});
