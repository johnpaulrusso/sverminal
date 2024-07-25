import { CommandHistoryStrategy } from "$lib/history/commandhistorystrategy.js";

//Null strategy pattern
export class CommandHistoryDisabled extends CommandHistoryStrategy {
    push(command: string): void {}
    get(index: number): string {return ""}
    length(): number {return 0;}
    clear(): void {}
}