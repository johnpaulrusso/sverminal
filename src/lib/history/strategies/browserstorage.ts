import { CommandHistoryStrategy } from "$lib/history/commandhistorystrategy.js";

export class CommandHistoryBrowserStorage extends CommandHistoryStrategy {
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
