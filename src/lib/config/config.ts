export type SverminalConfiguration = {
	promptSuffix?: string;
	style?: {
		prompt?: string[];
		command?: string[];
		flags?: string[];
		info?: string[];
		error?: string[];
		warn?: string[];
		text?: string[];
	};
	history?: {
		enabled?: boolean;
		method?: string;
		limit?: number;
	};
	newlineBetweenCommands?: false;
	quoteMultiWordAutoCompletes?: true;
};

const DEFAULT_STYLE_PROMPT = ['text-emerald-400'];
const DEFAULT_STYLE_COMMAND = ['text-violet-400'];
const DEFAULT_STYLE_FLAGS = ['text-slate-400'];
const DEFAULT_STYLE_INFO = ['text-cyan-400'];
const DEFAULT_STYLE_ERROR = ['text-red-400'];
const DEFAULT_STYLE_WARN = ['text-yellow-400'];
const DEFAULT_STYLE_TEXT = ['text-slate-50'];
const DEFAULT_HISTORY_METHOD = 'memory';
const DEFAULT_HISTORY_LIMIT = 50;

export const defaultConfig: SverminalConfiguration = {
	promptSuffix: '>',
	style: {
		prompt: DEFAULT_STYLE_PROMPT,
		command: DEFAULT_STYLE_COMMAND,
		flags: DEFAULT_STYLE_FLAGS,
		info: DEFAULT_STYLE_INFO,
		error: DEFAULT_STYLE_ERROR,
		warn: DEFAULT_STYLE_WARN,
		text: DEFAULT_STYLE_TEXT
	},
	history: {
		enabled: true,
		method: DEFAULT_HISTORY_METHOD, //memory (default), sessionStorage (tbd), localStorage (tbd)
		limit: DEFAULT_HISTORY_LIMIT
	},
	newlineBetweenCommands: false,
	quoteMultiWordAutoCompletes: true
};

/** CONFIGURATION UTILS */
export function getStylePrompt(config: SverminalConfiguration) {
	return config.style ? (config.style.prompt ?? DEFAULT_STYLE_PROMPT) : DEFAULT_STYLE_PROMPT;
}

export function getStyleCommand(config: SverminalConfiguration) {
	return config.style ? (config.style.command ?? DEFAULT_STYLE_COMMAND) : DEFAULT_STYLE_COMMAND;
}

export function getStyleFlags(config: SverminalConfiguration) {
	return config.style ? (config.style.flags ?? DEFAULT_STYLE_FLAGS) : DEFAULT_STYLE_FLAGS;
}

export function getStyleInfo(config: SverminalConfiguration) {
	return config.style ? (config.style.info ?? DEFAULT_STYLE_INFO) : DEFAULT_STYLE_INFO;
}

export function getStyleError(config: SverminalConfiguration) {
	return config.style ? (config.style.error ?? DEFAULT_STYLE_ERROR) : DEFAULT_STYLE_ERROR;
}

export function getStyleWarn(config: SverminalConfiguration) {
	return config.style ? (config.style.warn ?? DEFAULT_STYLE_WARN) : DEFAULT_STYLE_WARN;
}

export function getStyleText(config: SverminalConfiguration) {
	return config.style ? (config.style.text ?? DEFAULT_STYLE_TEXT) : DEFAULT_STYLE_TEXT;
}

export function getHistoryEnabled(config: SverminalConfiguration) {
	return config.history ? (config.history.enabled ?? true) : true;
}

export function getHistoryMethod(config: SverminalConfiguration) {
	return config.history
		? (config.history.method ?? DEFAULT_HISTORY_METHOD)
		: DEFAULT_HISTORY_METHOD;
}

export function getHistoryLimit(config: SverminalConfiguration) {
	return config.history ? (config.history.limit ?? DEFAULT_HISTORY_LIMIT) : DEFAULT_HISTORY_LIMIT;
}
