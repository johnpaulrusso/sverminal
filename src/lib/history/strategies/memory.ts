import { CommandHistoryStrategy } from "$lib/history/commandhistorystrategy.js";

export class CommandHistoryMemory extends CommandHistoryStrategy {
    memoryStack: string[] = [];

    push(command: string): void {
        if(this.memoryStack.length >= this.limit){
            this.memoryStack.shift();
        }
        this.memoryStack.push(command);
    }

    get(index: number): string {
        let result = '';
    
        if(index > this.limit){
            return '';
        }
    
        if(this.memoryStack.length > 0 && index < this.memoryStack.length){
            const correctedIndex = this.memoryStack.length - index - 1;
            result = this.memoryStack.at(correctedIndex) ?? '';
        }
        
        return result;
    }

    length(): number {
        return this.memoryStack.length;
    }

    clear(): void {
        this.memoryStack = [];
    }
}