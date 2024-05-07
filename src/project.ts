import { UniqueObject } from './uniqueObject';
import { Times } from './times';

import { Price } from './pricing';
import { QuoteLineItem, QuoteLineItemGroup } from './quoteLines';

import { serialize, deserialize, serializable, list, object } from 'serializr';

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

export class ProjectContents {
	@serializable(object(QuoteContentsCategory))
	billables: QuoteContentsCategory = new QuoteContentsCategory({ name: 'billables', icon: '🕰️' });

	@serializable(object(QuoteContentsCategory))
	equipment: QuoteContentsCategory = new QuoteContentsCategory({ name: 'equipment', icon: '🔧' });

	@serializable(object(QuoteContentsCategory))
	transport: QuoteContentsCategory = new QuoteContentsCategory({ name: 'transport', icon: '🚚' });

	@serializable(object(QuoteContentsCategory))
	crew: QuoteContentsCategory = new QuoteContentsCategory({
		name: 'crew',
		icon: '👷'
	});

	@serializable(object(QuoteContentsCategory))
	travel: QuoteContentsCategory = new QuoteContentsCategory({
		name: 'travel',
		icon: '✈️'
	});

	@serializable(object(QuoteContentsCategory))
	other: QuoteContentsCategory = new QuoteContentsCategory({
		name: 'other',
		icon: '📝'
	});
}

export class Project extends UniqueObject {
	@serializable
	name: string = '';

	@serializable
	description: string = '';

	@serializable
	owner: string = '';

	@serializable(list(object(Times)))
	schedule: Times[] = [];

	@serializable(object(ProjectContents))
	contents: ProjectContents = new ProjectContents();

	constructor(options: Partial<Project> = {}) {
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
		return JSON.stringify(serialize(Project, this), null, 2);
	}

	static deserialize(input: string) {
		const unstringified = JSON.parse(input);
		return deserialize(Project, unstringified) as unknown as Project;
	}

	deepClone() {
		return Project.deserialize(this.serialize());
	}

	get metadata() {
		return {
			name: this.name,
			owner: this.owner,
			total: this.total.formatted,
			crewDays: this.contents.crew?.sumLineItemValue('totalQuantity') || 0,
			billableHours: this.contents.billables?.sumLineItemValue('totalQuantity') || 0
		};
	}
}
