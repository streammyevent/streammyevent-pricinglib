import { Times } from './times';
import { FactorGroup } from './pricing';
import { Price, Cost } from './pricing';
import { UniqueObject } from './uniqueObject';
import { generateId } from './uniqueObject';
import { serializable, object, list, reference } from 'serializr';

export class QuoteLineItem extends Cost {
	@serializable
	id: string = generateId();
	@serializable
	name?: string;
	@serializable
	description?: string;
	@serializable(reference(Times))
	start?: Times;
	@serializable(reference(Times))
	end?: Times;

	@serializable
	multiplierType?: string;

	meta?: any;

	constructor(options: Partial<QuoteLineItem> = {}) {
		super(options);
		Object.assign(this, options);
	}

	get days(): number | undefined {
		if (this.start && this.end) return Times.days(this.start?.start, this.end?.end);
	}

	get nights(): number | undefined {
		if (this.start && this.end) return Times.nights(this.start?.start, this.end?.end);
	}

	get hours(): number | undefined {
		if (this.start && this.end) return Times.hours(this.start?.start, this.end?.end);
	}

	get multiplier(): number {
		if (this.multiplierType === 'days') return this.days || 1;
		if (this.multiplierType === 'nights') return this.nights || 1;
		return this.multiplierValue || 1;
	}
}

export class QuoteLineItemGroup<T extends QuoteLineItem> extends UniqueObject {
	@serializable
	name: string = '';

	@serializable(reference(Times))
	start?: Times;

	@serializable(reference(Times))
	end?: Times;

	@serializable(reference(FactorGroup))
	factorGroup?: FactorGroup;

	@serializable(list(object(QuoteLineItem)))
	lineItems: T[] = [];

	constructor(options: Partial<QuoteLineItemGroup<T>> = {}) {
		super(options);
		Object.assign(this, options);
	}

	get days(): number | undefined {
		if (this.start && this.end) return Times.days(this.start?.start, this.end?.end);
	}

	get nights(): number | undefined {
		if (this.start && this.end) return Times.nights(this.start?.start, this.end?.end);
	}

	get hours(): number | undefined {
		if (this.start && this.end) return Times.hours(this.start?.start, this.end?.end);
	}

	static total<T extends QuoteLineItem>(lineItemGroup: QuoteLineItemGroup<T>): Price {
		let totalValue = 0;
		let currencyUnit: string = "EUR";

		lineItemGroup.lineItems.forEach((item) => {
			totalValue += item.total?.value;
			currencyUnit = currencyUnit || item.total?.unit;
		});

		return new Price(totalValue, currencyUnit);
	}

	get total(): Price {
		return QuoteLineItemGroup.total(this);
	}
}
