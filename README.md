# zaek

Streaming rabbitMQ service bus

## Installation

```shell
$ npm install zaek
```

## Quick start

First you need to add a reference to zaek in your application.

```javascript
const zaek = require('zaek');
```

Then you need to connect to a RabbitMQ instance by calling the `connect` function and providing the instance's url or connection settings.

```javascript
// either by supplying url
const zaekBroker = await zaek.connect({ url: 'amqp://...' });
// or configobject
const zaekBroker = await zaek.connect({
	protocol: 'amqp',
	hostname: 'localhost',
	port: 5672,
	username: 'guest',
	password: 'guest',
	locale: 'en_US',
	frameMax: 0,
	heartbeat: 0,
	vhost: '/',
});
```

If something goes wrong, an error is emitted on the `zaekBroker` object. So you should subscribe to the `error` event.

```js
zaekBroker.once('error', (errr) => {
	/// ...
});
```

Additionally, if you want to get informed when zaek becomes disconnected, subscribe to the `disconnect` event.

```js
zaekBroker.once('disconnect', (errr) => {
	/// ...
});
```

## License

The MIT License (MIT)
Copyright (c) 2014-2019 eCollect AG.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
