import { serializable, object, list, identifier, reference } from 'serializr';

export class Price {
	@serializable
	unit: string;

	@serializable
	value: number;

	constructor(value: number = 0, unit: string = 'EUR') {
		this.unit = unit;
		this.value = value;
	}

	get formatted() {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: this.unit }).format(
			this.value
		);
	}

	toString() {
		return this.formatted;
	}

	valueOf() {
		return this.value;
	}
}

export class Factor {
	@serializable
	from: number = 0;
	@serializable
	to: number = 1000000;
	@serializable
	factor: number = 1;

	constructor(options: Partial<Factor> = {}) {
		Object.assign(this, options);
	}
}

export class FactorGroup {
	@serializable(identifier())
	name: string = '';

	@serializable(list(object(Factor)))
	factors: Factor[] = [];

	constructor(options: Partial<FactorGroup> = {}) {
		Object.assign(this, options);
	}
}

export class Cost {
	@serializable(object(Price))
	price: Price = new Price(0, 'EUR');
	@serializable(object(Price))
	costInternal: Price = new Price(0, 'EUR');
	@serializable(object(Price))
	costExternal: Price = new Price(0, 'EUR');
	@serializable
	quantity: number = 0;
	@serializable
	multiplierValue?: number;
	@serializable(object(FactorGroup))
	factorGroup?: FactorGroup;
	@serializable
	discountPercent: number = 0;
	@serializable(object(Price))
	discountAmount: Price = new Price(0, 'EUR');

	constructor(options: Partial<Cost> = {}) {
		Object.assign(this, options);
	}

	get multiplier(): number {
		return this.multiplierValue || 1;
	}

	get totalQuantity(): number {
		return this.quantity * (this.multiplier || 1);
	}

	factor(): number {
		if (!this.factorGroup) {
			return this.multiplier;
		}
		let closestFactor = this.factorGroup.factors[0];
		for (let i = 1; i < this.factorGroup.factors.length; i++) {
			if (
				Math.abs(this.multiplier - this.factorGroup.factors[i].from) <
				Math.abs(this.multiplier - closestFactor.from)
			) {
				closestFactor = this.factorGroup.factors[i];
			}
		}
		return closestFactor.factor;
	}

	get subtotalBeforeMultiplier(): Price {
		return new Price(this.price.value * this.quantity, this.price.unit);
	}

	get subtotalAfterMultiplier(): Price {
		return new Price(this.subtotalBeforeMultiplier.value * this.factor(), this.price.unit);
	}

	get discount(): Price {
		return new Price(
			this.discountAmount.value + this.subtotalAfterMultiplier.value * this.discountPercent,
			this.price.unit
		);
	}

	get total(): Price {
		const subtotalValue = this.subtotalAfterMultiplier.value;
		const discountValue = this.discount.value;
		const totalValue = subtotalValue - discountValue;
		return new Price(totalValue, this.price.unit);
	}
}
