'use strict';

const rabbot = require('./rabbot');

rabbot().then(async (rabbot) => {
	await rabbot.addExchange('nu-zaez-6', 'direct', {
		durable: false,
	});


	rabbot.onReturned( function( message ) {
		console.log(message);
	});

	await rabbot.publish('nu-zaez-6', {
		correlationId: '2',
		routingKey: 'msg',
		mandatory: true,
		body: { mitko: 'is here' },
	})
	.then((a) => {
		console.log('success', a)
	})
	.catch(e => console.log(e))
	console.log('d');
});
