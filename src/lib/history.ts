import { defaultConfig, type Config } from '$lib/config/defaultConfig.js'

const config = defaultConfig;

export function createCommandHistoryStrategy(): CommandHistoryStrategy{
    if(!config.history.enabled){
        return new CommandHistoryDisabled(config.history.limit);
    }else if(config.history.method === "localstorage"){
        return new CommandHistoryBrowserStorage(config.history.limit);
    }else if(config.history.method === "sessionstorage"){
        return new CommandHistoryBrowserStorage(config.history.limit);
    }else{
        return new CommandHistoryMemory(config.history.limit);
    }
}

export abstract class CommandHistoryStrategy {
    readonly limit: number

    constructor(limit: number) {
        this.limit = limit
    }

    abstract push(command: string): void;
    abstract get(index: number): string;
    abstract length(): number;
}

//Null strategy pattern
class CommandHistoryDisabled extends CommandHistoryStrategy {
    push(command: string): void {}
    get(index: number): string {return ""}
    length(): number {return 0;}
}

class CommandHistoryMemory extends CommandHistoryStrategy {
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
}

class CommandHistoryBrowserStorage extends CommandHistoryStrategy {
    static readonly STORAGE_KEY: string = "sverminal-history";
    push(command: string): void {}
    get(index: number): string {return ""}
    length(): number {return 0;}
}
