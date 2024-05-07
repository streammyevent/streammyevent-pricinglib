import { nanoid } from 'nanoid';

export function generateId() {
	return nanoid(7);
}

import { identifier, serializable } from 'serializr';

export class UniqueObject {
	@serializable(identifier())
	id: string = generateId();

	constructor(options: Partial<UniqueObject> = {}) {
		Object.assign(this, options);
	}
}
