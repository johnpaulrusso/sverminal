const customConfig = {
	promptSuffix: '>',
	style: {
		prompt: ['text-emerald-400'],
		command: ['text-violet-400'],
		flags: ['text-slate-400'],
		info: ['text-cyan-400'],
		error: ['text-red-400'],
		warn: ['text-yellow-400'],
		text: ['text-slate-50']
	},
	history: {
		enabled: true,
		method: 'memory', //memory (default), sessionstorage (tbd), localstorage (tbd)
		limit: 10
	},
	newlineBetweenCommands: false,
	quoteMultiWordAutoCompletes: true
};
export default customConfig;
