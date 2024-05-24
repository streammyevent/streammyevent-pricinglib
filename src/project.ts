import { UniqueObject } from './uniqueObject';
import { Times } from './times';

import { Price } from './pricing';
import { QuoteLineItem, QuoteLineItemGroup } from './quoteLines';

import { serialize, deserialize, serializable, list, object, map } from 'serializr';

export class ProjectContentsCategory {
	@serializable
	name: string = '';

	@serializable
	icon: string = '';

	@serializable(list(object(QuoteLineItemGroup)))
	groups: QuoteLineItemGroup<QuoteLineItem>[] = [];

	constructor(options: Partial<ProjectContentsCategory> = {}) {
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

// export class ProjectContents {
// 	@serializable(object(ProjectContentsCategory))
// 	billables: ProjectContentsCategory = new ProjectContentsCategory({ name: 'billables', icon: '🕰️' });

// 	@serializable(object(ProjectContentsCategory))
// 	equipment: ProjectContentsCategory = new ProjectContentsCategory({ name: 'equipment', icon: '🔧' });

// 	@serializable(object(ProjectContentsCategory))
// 	transport: ProjectContentsCategory = new ProjectContentsCategory({ name: 'transport', icon: '🚚' });

// 	@serializable(object(ProjectContentsCategory))
// 	crew: ProjectContentsCategory = new ProjectContentsCategory({
// 		name: 'crew',
// 		icon: '👷'
// 	});

// 	@serializable(object(ProjectContentsCategory))
// 	travel: ProjectContentsCategory = new ProjectContentsCategory({
// 		name: 'travel',
// 		icon: '✈️'
// 	});

// 	@serializable(object(ProjectContentsCategory))
// 	other: ProjectContentsCategory = new ProjectContentsCategory({
// 		name: 'other',
// 		icon: '📝'
// 	});
// }

export class Project extends UniqueObject {
	@serializable
	name: string = '';

	@serializable
	description: string = '';

	@serializable
	owner: string = '';

	@serializable(list(object(Times)))
	schedule: Times[] = [];

	@serializable(map(object(ProjectContentsCategory)))
	contents: { [key: string]: ProjectContentsCategory } = {}

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
