import { UniqueObject } from './uniqueObject';
import { Times } from './times';

import { Price } from './pricing';
import { QuoteLineItem, QuoteLineItemGroup } from './quoteLines';

import { serialize, deserialize, serializable, list, object, map } from 'serializr';

export class QuoteContentsCategory {
	@serializable
	name: string = '';

	@serializable
	icon: string = '';

	@serializable(list(object(QuoteLineItemGroup)))
	groups: QuoteLineItemGroup<QuoteLineItem>[] = [];

	constructor(options: Partial<QuoteContentsCategory> = {}) {
		Object.assign(this, options);
	}

	get title() {
		return this.icon + ' ' + this.name.charAt(0).toUpperCase() + this.name.slice(1);
	}

	get total(): Price {
		let total = 0;

		total = this.groups.reduce((sum, group) => {
			return sum + group.total.value;
		}, 0);

		return new Price(total, 'EUR');
	}

	sumLineItemValue(key: string) {
		return this.groups.reduce((sum, group) => {
			return (
				sum +
				group.lineItems.reduce((sum, lineItem) => {
					return sum + Number(lineItem[key as keyof QuoteLineItem]);
				}, 0)
			);
		}, 0);
	}
}

export class Quote extends UniqueObject {
	@serializable(list(object(Times)))
	schedule: Times[] = [];

	@serializable(map(object(QuoteContentsCategory)))
	contents: { [key: string]: QuoteContentsCategory } = {}

	constructor(options: Partial<Quote> = {}) {
		super(options);
		Object.assign(this, options);
	}

	get total(): Price {
		let total = 0;

		total = Object.values(this.contents).reduce((sum, category) => {
			return sum + category.total.value;
		}, 0);

		return new Price(total, 'EUR');
	}

	serialize() {
		return JSON.stringify(serialize(Quote, this), null, 2);
	}

	static deserialize(input: string) {
		const unstringified = JSON.parse(input);
		return deserialize(Quote, unstringified) as unknown as Quote;
	}

	deepClone() {
		return Quote.deserialize(this.serialize());
	}

	get metadata() {
		return {
			total: this.total.formatted,
			crewDays: this.contents.crew?.sumLineItemValue('totalQuantity') || 0,
			billableHours: this.contents.billables?.sumLineItemValue('totalQuantity') || 0
		};
	}
}
