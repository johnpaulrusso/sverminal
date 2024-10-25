export class AutoCompleter {
	options: string[];
	currentOptionIndex: number;
	lastKnownUserInput: string;

	constructor() {
		this.options = [];
		this.currentOptionIndex = 0;
		this.lastKnownUserInput = '';
	}

	reset() {
		this.options = [];
		this.currentOptionIndex = 0;
		this.lastKnownUserInput = '';
	}

	setOptions(options: string[]) {
		this.options = options.sort((a, b) => a.localeCompare(b));
		this.currentOptionIndex = 0;
		this.lastKnownUserInput = '';
	}

	getNextOption(userInput: string): string {
		let result: string = '';

		//Detect input changes to reset index.
		const inputChanged = userInput !== this.lastKnownUserInput;
		if (inputChanged) {
			this.currentOptionIndex = 0;
			this.lastKnownUserInput = userInput;
		}

		//Handle cases of empty input.
		if (!userInput && this.options.length == 0) {
			return '';
		} else if (!userInput) {
			if (this.currentOptionIndex >= this.options.length) {
				this.currentOptionIndex = 0;
			}
			return this.options[this.currentOptionIndex++];
		}

		//Find matching inputs.
		const results: string[] = [];
		this.options.forEach((o) => {
			if (o.startsWith(userInput)) {
				results.push(o);
			}
		});

		if (results.length > 0) {
			if (this.currentOptionIndex >= results.length) {
				this.currentOptionIndex = 0;
			}
			result = results[this.currentOptionIndex++];
		}

		return result;
	}
}
