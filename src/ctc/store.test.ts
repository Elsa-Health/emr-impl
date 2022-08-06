import { executeAll, executeChain } from "./store";

// function sleep(ms: number) {
// 	return new Promise((resolve) => setTimeout(resolve, ms));
// }

describe("Executors", () => {
	it("executeChain(runs[])", () => {
		const p: number[] = [];
		expect(
			(async () => {
				await executeChain([
					() => p.push(1),
					() => p.push(2),
					() => p.push(2),
					() => p.push(3),
				]);
				return p;
			})()
		).resolves.toEqual([1, 2, 2, 3]);
	});

	it("executeAll(runs[])", () => {
		expect(
			(async () => {
				const s = new Set();
				await executeAll([
					() => s.add(1),
					() => s.add(2),
					() => s.add(3),
				]);
				return s;
			})()
		).resolves.toEqual(new Set([1, 2, 3]));
	});
});
