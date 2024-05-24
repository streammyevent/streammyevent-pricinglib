import { describe, expect, test } from "bun:test";
import { FactorGroup, Factor } from "..";

describe("Factors", () => {
	const factorGroup = new FactorGroup({
		name: "Test",
		factors: [
			new Factor({ range: [0, 1], factor: 1 }),
			new Factor({ range: [1, 7], factor: 0.5 }),
			new Factor({ range: [7, Infinity], factor: 0.2 })
		]
	})

	test("factor 1", () => {
		expect(factorGroup.getFactor(1)).toBe(1);
	});
	test("factor 2", () => {
		expect(factorGroup.getFactor(2)).toBe(1.5);
	});
	test("factor 3", () => {
		expect(factorGroup.getFactor(3)).toBe(2);
	});
	test("factor 4", () => {
		expect(factorGroup.getFactor(4)).toBe(2.5);
	});
	test("factor 5", () => {
		expect(factorGroup.getFactor(5)).toBe(3);
	});
	test("factor 6", () => {
		expect(factorGroup.getFactor(6)).toBe(3.5);
	});
	test("factor 7", () => {
		expect(factorGroup.getFactor(7)).toBe(4);
	});
	test("factor 8", () => {
		expect(factorGroup.getFactor(8)).toBe(4.2);
	});
	test("factor 9", () => {
		expect(factorGroup.getFactor(9)).toBe(4.4);
	});
	test("factor 10", () => {
		expect(factorGroup.getFactor(10)).toBe(4.6);
	});
	test("factor 11", () => {
		expect(factorGroup.getFactor(11)).toBe(4.8);
	});
	test("factor 12", () => {
		expect(factorGroup.getFactor(12)).toBe(5);
	});
})