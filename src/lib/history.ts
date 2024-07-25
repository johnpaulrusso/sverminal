import { defaultConfig } from '$lib/config/defaultConfig.js'

const config = defaultConfig;

export function createCommandHistory(): CommandHistoryStrategy{
    if(!config.history.enabled){
        return new CommandHistoryDisabled(config.history.limit);
    }else if(config.history.method === 'localStorage'){
        return new CommandHistoryBrowserStorage(config.history.limit, 'localStorage');
    }else if(config.history.method === 'sessionStorage'){
        return new CommandHistoryBrowserStorage(config.history.limit, 'sessionStorage');
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
    abstract clear(): void;
}

//Null strategy pattern
class CommandHistoryDisabled extends CommandHistoryStrategy {
    push(command: string): void {}
    get(index: number): string {return ""}
    length(): number {return 0;}
    clear(): void {}
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

    clear(): void {
        this.memoryStack = [];
    }
}

class CommandHistoryBrowserStorage extends CommandHistoryStrategy {
    static readonly STORAGE_KEY: string = "sverminal-history";
    readonly storage: Storage;

    constructor(limit: number, method: string){
        super(limit);
        if(method === 'localStorage'){
            this.storage = localStorage;
        }else{
            this.storage = sessionStorage;
        }
    }

    private getItem(): string | null{
        return this.storage.getItem(CommandHistoryBrowserStorage.STORAGE_KEY);
    }

    push(command: string): void {
        const item = this.getItem();
        if(!item){
            const history = [command];
            this.storage.setItem(
                CommandHistoryBrowserStorage.STORAGE_KEY, 
                JSON.stringify(history)
            );
        }else{
            let history = JSON.parse(item) as string[];
            if(history.length >= this.limit){
                history.shift();
            }
            history.push(command);
            this.storage.setItem(
                CommandHistoryBrowserStorage.STORAGE_KEY, 
                JSON.stringify(history)
            )
        }
    }

    get(index: number): string {
        if(index > this.limit){
            return '';
        }

        const item = this.getItem();
        if(!item){
            return '';
        } 

        const history = JSON.parse(item) as string[];
        if(history.length > 0 && index < history.length){
            const correctedIndex = history.length - index - 1;
            return history.at(correctedIndex) ?? '';
        }

        return '';
    }

    length(): number {
        const item = this.getItem();
        if(!item){
            return 0;
        } else {
            const history = JSON.parse(item) as string[];
            return history.length;
        }
    }

    clear(): void {
        this.storage.removeItem(CommandHistoryBrowserStorage.STORAGE_KEY);
    }
}
