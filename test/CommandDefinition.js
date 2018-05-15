'use strict';

const Command = require('./Commnad');

const SCHEMAS_PREFIX = '/schemas/';

class CommandDefinition {
	constructor(name, context, aggregate, schema, validationContext) {
		this.name = name;
		this.aggregate = aggregate;
		this.schema = CommandDefinition.normalizeSchemaName(schema);
		this.context = context;
		this._validationContext = validationContext;
	}

	async create(payload, metadata, id) {
		return this._validationContext.getErrorsAsync(this.schema, payload)
			.then(() => new Command(this.name, this.context, this.aggregate, id, payload, metadata))
			.catch((error) => {
				throw error;
			});
	}

	static normalizeSchemaName(name) {
		return name.startsWith(SCHEMAS_PREFIX) ? name : `${SCHEMAS_PREFIX}${name}`;
	}
}

module.exports = CommandDefinition;
