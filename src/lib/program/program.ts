import { SverminalReader } from '$lib/reader/reader.js';
import { SverminalWriter } from '$lib/writer/writer.js';

export abstract class Program {
	/**Every program must have a name. */
	readonly name: string;

	readonly reader: SverminalReader;
	readonly writer: SverminalWriter;

	constructor(name: string) {
		this.name = name;
		this.reader = new SverminalReader();
		this.writer = new SverminalWriter();
	}

	abstract processCommand(command: string): Promise<void>;

	/** Optional welcome message. */
	getWelcomeMessage(): string {
		return '';
	}

	/** Prefix that will replace the default. Ex: sverminal> becomes promptPrefix>
	 * This is a required parameter so that the user knows a program is running.
	 */
	getPrefix(): string {
		return this.name.toLowerCase();
	}

	/** Most importantly, every program MUST specify the command that will be used to close the program. */
	getExitCommand(): string {
		return 'exit';
	}
}
