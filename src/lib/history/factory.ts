import { defaultConfig, getHistoryEnabled, getHistoryMethod, getHistoryLimit } from '$lib/config/config.js';
import type { CommandHistoryStrategy } from '$lib/history/commandhistorystrategy.js';
import { CommandHistoryDisabled } from '$lib/history/strategies/disabled.js';
import { CommandHistoryMemory } from '$lib/history/strategies/memory.js';
import { CommandHistoryBrowserStorage } from '$lib/history/strategies/browserstorage.js';

const config = defaultConfig;

export function createCommandHistory(): CommandHistoryStrategy {
    const method = getHistoryMethod(config);
    const limit = getHistoryLimit(config)
	if (!getHistoryEnabled(config)) {
		return new CommandHistoryDisabled(limit);
	} else if (method === 'localStorage') {
		return new CommandHistoryBrowserStorage(limit, 'localStorage');
	} else if (method=== 'sessionStorage') {
		return new CommandHistoryBrowserStorage(limit, 'sessionStorage');
	} else {
		return new CommandHistoryMemory(limit);
	}
}
