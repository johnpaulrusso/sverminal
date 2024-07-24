import { defaultConfig, type Config } from '$lib/config/defaultConfig.js'

const config = defaultConfig;
const STORAGE_KEY = "sverminal-history";

let memoryStack: string[] = [];

export function push(command: string){
    if(config.history.enabled){
        if(config.history.method === "localstorage"){

        }else if(config.history.method === "sessionstorage"){

        }else { //memory 
            if(memoryStack.length >= config.history.limit){
                memoryStack.shift();
            }
            memoryStack.push(command);
        }
    }
}

export function pop(): string{
    let result = '';
    if(config.history.enabled){
        if(config.history.method === "localstorage"){

        }else if(config.history.method === "sessionstorage"){

        }else { //memory 
            if(memoryStack.length > 0){
                result = memoryStack.pop() ?? '';
            }
        }
    }
    return result;
}

export function get(index: number): string{
    let result = '';

    if(!config.history.enabled){
        return '';
    }

    if(index > config.history.limit){
        return '';
    }

    if(config.history.method === "localstorage"){

    }else if(config.history.method === "sessionstorage"){

    }else { //memory 
        if(memoryStack.length > 0 && index < memoryStack.length){
            const correctedIndex = memoryStack.length - index - 1;
            result = memoryStack.at(correctedIndex) ?? '';
        }
    }
    
    return result;
}

export function length(): number {
    return memoryStack.length;
}