import { MainProgram, type ProgramParamters } from './program.js';

export class DemoProgram extends MainProgram {
	constructor() {
		const params: ProgramParamters = {
			name: 'sverminal',
			prompt: 'sverminal'
		};
		super(params);
	}

	async processCommand(command: string): Promise<void> {
		// Your command processing logic here
		console.log('Processing command from parent component:', command);

		/*
        if(programMode){
            
            if(command === demoProgram.exitCommand){
                programMode = false;
                promptPrefix = DEFAULT_PROMPT_PREFIX;
            }else{
                await demoProgram.processCommand(command);
            }

            return;
        }*/

		//First we should break the command up into pieces.
		const commandParts: string[] = command.split(' ');

		if (commandParts.length == 0) {
			return;
		}

		const method = commandParts.at(0);
		const args = commandParts.length > 0 ? commandParts.slice(1) : [];

		if (method === 'help') {
			this.writer.info('TODO - Implement the help command!');
		} else if (method === 'echo') {
			this.echo(args);
		} else if (method === 'warn') {
			this.warn(args);
		} else if (method === 'error') {
			this.error(args);
		} else if (method === 'info') {
			this.info(args);
		} else if (method === 'countdown') {
			await this.countdown(args);
		} else if (method === 'freeform-demo') {
			this.printStylesExample();
		} else if (method === 'input-demo') {
			await this.runInputDemo();
			/*
        } else if (method === 'program') {
            programMode = true;
            promptPrefix = demoProgram.promptPrefix;
            sverminalWriter.info(demoProgram.welcomeMessage ?? "Running demo program!");
        } else if (method === 'exit' && programMode) {
            programMode = false;*/
		} else {
			this.writer.error(`${method} is not recognized as a valid command.`);
		}
	}

	/** Optional welcome message. */
	getWelcomeMessage(): string {
		return 'Welcome to the Sverminal demo program!';
	}

	/**Custom */
	echo(args: string[]) {
		if (args.length == 0) {
			this.writer.error('echo requires at least one argument. Usage: echo message');
		} else {
			const message = args.join(' ');
			this.writer.echo(message);
		}
	}

	warn(args: string[]) {
		if (args.length == 0) {
			this.writer.error('warn requires at least one argument. Usage: warn message');
		} else {
			const message = args.join(' ');
			this.writer.warn(message);
		}
	}

	error(args: string[]) {
		if (args.length == 0) {
			this.writer.error('error requires at least one argument. Usage: error message');
		} else {
			const message = args.join(' ');
			this.writer.error(message);
		}
	}

	info(args: string[]) {
		if (args.length == 0) {
			this.writer.error('info requires at least one argument. Usage: info <message>');
		} else {
			const message = args.join(' ');
			this.writer.info(message);
		}
	}

	printStylesExample() {
		const text = 'Style';
		this.writer.write('|-----------------------------|');
		this.writer.write('\n');
		this.writer.write('|     ');
		this.writer.write(` Red  `, ['text-red-500']);
		this.writer.write(' ');
		this.writer.write(`Green `, ['text-green-500']);
		this.writer.write(' ');
		this.writer.write(` Blue`, ['text-blue-500']);
		this.writer.write('     |');
		this.writer.write('\n');
		this.writer.write('|-----------------------------|');
	}

	async delay(delayInms: number) {
		return new Promise((resolve) => setTimeout(resolve, delayInms));
	}

	async countdown(args: string[]) {
		if (args.length != 1) {
			this.writer.error(
				'countdown requires a positive integer argument between and including 1 and 99. Usage: countdown number'
			);
			return;
		}

		const arg = args[0];
		const regex = /^\s*[0-9]{1,2}\s*$/;
		if (!regex.test(arg)) {
			this.writer.error(
				'countdown requires a positive integer argument between and including 1 and 99. Usage: countdown number'
			);
			return;
		}

		const start = parseInt(arg[0]);
		if (start < 1 || 99 < start) {
			this.writer.error(
				'countdown requires a positive integer argument between and including 1 and 99. Usage: countdown number'
			);
			return;
		}

		for (let i = start; i > 0; --i) {
			this.writer.echo(`countdown: ${i}`);
			await this.delay(1000);
		}
	}

	async runInputDemo() {
		let name = '';
		let quest = '';
		let color = '';
		this.writer.echo('Please answer the following questions:');
		await this.reader.read('What is your name?').then((value: string) => {
			name = value;
		});
		await this.reader.read('What is your quest?').then((value: string) => {
			quest = value;
		});
		await this.reader.read('What is your favorite color?').then((value: string) => {
			color = value;
		});
		this.writer.echo(`Your answers: ${name}, ${quest}, ${color}`);
	}
}
