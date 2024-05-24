import { serializable, object, list, identifier, reference, primitive } from 'serializr';

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
	@serializable(list(primitive()))
	range: [number, number] = [0, Infinity];
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

	// Example to get the multiplier. For each range in the factors array,
	// multiply each number in the 
	getFactor(multiplier: number): number {
		let totalFactor = 0;
		for (let step = 0; step < multiplier; step++) {
			for (const factor of this.factors) {
				if (step >= factor.range[0] && step < factor.range[1]) {
					totalFactor += factor.factor;
					break;
				}
			}
		}
		return Number(totalFactor.toPrecision(4))
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
		return this.factorGroup.getFactor(this.multiplier);
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
