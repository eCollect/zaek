<p align="center">
	<img src="assets/images/logo/vector/default.svg" width="300px" height="auto"/>
</p>

<h1 align="center">zaek</h1>

<p align="center">
Simplifies work with streaming RabbitMQ exchanges and queues.
</p>

<p align="center">
<a href="https://travis-ci.org/eCollect/zaek" title="Build Status"><img src="https://travis-ci.org/eCollect/zaek.svg?branch=master" alt="Build Status" /></a>
<a href="https://www.npmjs.com/package/zaek" title="Build Status">
<img alt="zaek" src="https://img.shields.io/npm/v/zaek">
</a>
<a href='https://coveralls.io/github/eCollect/zaek?branch=next' title="Coverage Status"><img src='https://coveralls.io/repos/github/eCollect/zaek/badge.svg?branch=next' alt='Coverage Status' /></a>
<a href="https://snyk.io/test/github/ecollect/zaek" title="Known Vulnerabilities">
<img src="https://snyk.io/test/github/ecollect/zaek/badge.svg" alt="Known Vulnerabilities">
</a>
<a href="/eCollect/zaek/blob/master/LICENSE" title="zaek MIT license"><img alt="MIT" src="https://img.shields.io/github/license/ecollect/zaek"></a>

</p>

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
zaekBroker.once('error', (err) => {
	/// ...
});
```

Additionally, if you want to get informed when zaek becomes disconnected, subscribe to the `disconnect` event.

```js
zaekBroker.once('disconnect', (err) => {
	/// ...
});
```

## Implemented Patterns

### Worker

A Worker Queue is a combination of a single exchange with a single queue that shares its load across multiple nodes ( Round-robin dispatching ). One of the advantages of using a Worker Queue is the ability to easily parallelize work. If we are building up a backlog of work, we can just add more workers and that way, scale easily.

For that, call the worker function on the zaekBroker and specify a name.

```js
const worker = zaekBroker.worker('zaek:test:worker');
```

To publish messages to this worker, call the createWriteStream function, and then use the write function of the stream that is returned. You have to supply the body of the message in the ```body``` property

```js
const publishStream = await worker.createWriteStream();
publishStream.write({ body: { foo: 'bar' } });
```

To subscribe to messages received by this worker, call the createReadStream function, and then subscribe to the stream's data event. You can access the message's body through its ```body``` property.

Additionally, you need to process the received message. If you were able to successfully handle the message, call the ```ack``` function. If not, either call ```reject``` (which removes the message), or call ```nack``` (which requeues the message).

```js
const workSrream = await worker.createReadStream();
workSrream.on('data', (message) => {
	console.log(`foo says ${message.body.foo}`); // foo says bar
  // ...
  message.ack(); // or message.reject(); or message.nack();
});
```

> **TODO** explain about additional available options. Especially persistence.

### Pub-Sub

A publisher is a combination of a single exchange with multiple queues where each queue receives all messages. For that, call the publisher function and specify a name.

// TODO...

## License

MIT License

Copyright (c) 2018-2019 eCollect AG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
