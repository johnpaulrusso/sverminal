import { defaultConfig } from '$lib/config/defaultConfig.js'
import type { CommandHistoryStrategy } from '$lib/history/commandhistorystrategy.js';
import { CommandHistoryDisabled } from '$lib/history/strategies/disabled.js';
import { CommandHistoryMemory } from '$lib/history/strategies/memory.js';
import { CommandHistoryBrowserStorage } from '$lib/history/strategies/browserstorage.js';

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