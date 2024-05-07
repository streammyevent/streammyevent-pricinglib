import { serializable, primitive } from 'serializr';
import { UniqueObject } from './uniqueObject';

export class Times extends UniqueObject {
	@serializable(primitive())
	name?: string;

	@serializable(primitive())
	comment?: string;

	@serializable(primitive())
	start: string = '';

	@serializable(primitive())
	end: string = '';

	@serializable(primitive())
	timezone: string = '';

	constructor(options: Partial<Times> = {}) {
		super(options);
		Object.assign(this, options);
	}

	static startAsDate(start: string): Date {
		return new Date(start);
	}

	get startAsDate(): Date {
		return Times.startAsDate(this.start);
	}

	static endAsDate(end: string): Date {
		return new Date(end);
	}

	get endAsDate(): Date {
		return Times.endAsDate(this.end);
	}

	static hours(start: string, end: string): number {
		return Math.ceil(
			(Times.endAsDate(end).getTime() - Times.startAsDate(start).getTime()) / 3600 / 1000
		);
	}

	get hours(): number {
		return Times.hours(this.start, this.end);
	}

	static days(start: string, end: string): number {
		return Math.ceil(Times.hours(start, end) / 24);
	}

	get days(): number {
		return Times.days(this.start, this.end);
	}

	static nights(start: string, end: string): number {
		// Assuming that "nights" are the number of full days between start and end, minus one.
		return Math.max(Times.days(start, end) - 1, 0);
	}

	get nights(): number {
		return Times.nights(this.start, this.end);
	}

	static formattedStart(start: string, timezone: string): string {
		return Times.startAsDate(start).toLocaleString('nl-NL', { timeZone: timezone });
	}

	get formattedStart(): string {
		return Times.formattedStart(this.start, this.timezone);
	}

	static formattedEnd(end: string, timezone: string): string {
		return Times.endAsDate(end).toLocaleString('nl-NL', { timeZone: timezone });
	}

	get formattedEnd(): string {
		return Times.formattedEnd(this.end, this.timezone);
	}
}
