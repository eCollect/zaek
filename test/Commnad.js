'use strict';

class Command {
	constructor(name, aggregate, context, payload, metadata) {
		this.name = name;
		this.aggregate = aggregate;
		this.context = context;
		this.metadata = metadata;
		this.payload = payload;
	}

	serialize() {
		return this;
	}

	static deserialize({
		name, aggregate, context, payload, metadata,
	}) {
		return new Command(name, aggregate, context, payload, metadata);
	}
}

module.exports = Command;
