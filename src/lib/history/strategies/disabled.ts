import { CommandHistoryStrategy } from '$lib/history/commandhistorystrategy.js';

//Null strategy pattern
export class CommandHistoryDisabled extends CommandHistoryStrategy {
	push(): void {}
	get(): string {
		return '';
	}
	length(): number {
		return 0;
	}
	clear(): void {}
}
