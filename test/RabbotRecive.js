'use strict';

const rabbo = require('./rabbot');

rabbo().then(async (rabbot) => {
	try {
		await rabbot.addExchange('nu-zaez-6', 'direct', {
			durable: false,
		});

		await rabbot.addQueue('queue-126', {
			autoDelete: true,
		});

		await rabbot.addQueue('queue-127', {
			autoDelete: true,
		});

		await rabbot.bindQueue('nu-zaez-6', 'queue-126', ['msg']);
		await rabbot.bindQueue('nu-zaez-6', 'queue-127', ['msg']);

		const h = rabbot.handle('*', (m) => {
			console.log('i got it');
			// m.reply({ m: 'ddd'});
			m.ack();
			// console.log(m);
		});

		h.catch(( err, msg ) => {
			// do something with the error & message
			msg.nack();
		});

		await rabbot.startSubscription('queue-126');
		await rabbot.startSubscription('queue-127');

		console.log('d');
	} catch(e) {
		console.error(e);
	}
}).catch((e) => {

});
