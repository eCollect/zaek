'use strict';

const rabbot = require('rabbot');

/*
rabbot.handle('MyMessage', (msg) => {
	console.log('received msg', msg.body);
	msg.ack();
});

rabbot.handle('MyRequest', (req) => {
	req.reply('yes?');
});
*/

module.exports = () => {
	return rabbot.configure({
		connection: {
			user: 'guest',
			pass: 'guest',
			server: ['127.0.0.1'],
			port: 5672,
			publishTimeout: 100,
			timeout: 1000,
			failAfter: 30,
			retryLimit: 400,
		},
		/*
		// define the exchanges
		exchanges: [{
			name: 'wascally-pubsub-requests-x',
			type: 'direct',
			autoDelete: true,
		}],
		*/
	}).then(() => rabbot);
};
