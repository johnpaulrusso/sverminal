export abstract class CommandHistoryStrategy {
	readonly limit: number;

	constructor(limit: number) {
		this.limit = limit;
	}

	abstract push(command: string): void;
	abstract get(index: number): string;
	abstract length(): number;
	abstract clear(): void;
}
