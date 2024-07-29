<script lang="ts">
	import '../app.css';
	import Sverminal from '$lib/Sverminal.svelte';
	import { SverminalWriter } from '$lib/writer/writer.js';

	let sverminalWriter = new SverminalWriter();

	function echo(args: string[]) {
		if (args.length == 0) {
			sverminalWriter.error('echo requires at least one argument. Usage: echo message');
		} else {
			const message = args.join(' ');
			sverminalWriter.echo(message);
		}
	}

	function warn(args: string[]) {
		if (args.length == 0) {
			sverminalWriter.error('warn requires at least one argument. Usage: warn message');
		} else {
			const message = args.join(' ');
			sverminalWriter.warn(message);
		}
	}

	function error(args: string[]) {
		if (args.length == 0) {
			sverminalWriter.error('error requires at least one argument. Usage: error message');
		} else {
			const message = args.join(' ');
			sverminalWriter.error(message);
		}
	}

	function info(args: string[]) {
		if (args.length == 0) {
			sverminalWriter.error('info requires at least one argument. Usage: info <message>');
		} else {
			const message = args.join(' ');
			sverminalWriter.info(message);
		}
	}

	const delay = (delayInms: number) => {
		return new Promise((resolve) => setTimeout(resolve, delayInms));
	};

	async function countdown(args: string[]) {
		if (args.length != 1) {
			sverminalWriter.error(
				'countdown requires a positive integer argument between and including 1 and 99. Usage: countdown number'
			);
			return;
		}

		const arg = args[0];
		const regex = /^\s*[0-9]{1,2}\s*$/;
		if (!regex.test(arg)) {
			sverminalWriter.error(
				'countdown requires a positive integer argument between and including 1 and 99. Usage: countdown number'
			);
			return;
		}

		const start = parseInt(arg[0]);
		if (start < 1 || 99 < start) {
			sverminalWriter.error(
				'countdown requires a positive integer argument between and including 1 and 99. Usage: countdown number'
			);
			return;
		}

		for (let i = start; i > 0; --i) {
			sverminalWriter.echo(`countdown: ${i}`);
			await delay(1000);
		}
	}

	async function processCommand(command: string): Promise<void> {
		// Your command processing logic here
		console.log('Processing command from parent component:', command);

		//First we should break the command up into pieces.
		const commandParts: string[] = command.split(' ');

		if (commandParts.length == 0) {
			return;
		}

		const method = commandParts.at(0);
		const args = commandParts.length > 0 ? commandParts.slice(1) : [];

		if (method === 'help') {
			sverminalWriter.info('TODO - Implement the help command!');
		} else if (method === 'echo') {
			echo(args);
		} else if (method === 'warn') {
			warn(args);
		} else if (method === 'error') {
			error(args);
		} else if (method === 'info') {
			info(args);
		} else if (method === 'countdown') {
			await countdown(args);
		} else {
			sverminalWriter.error(`${method} is not recognized as a valid command.`);
		}
	}
</script>

<div class="w-full flex flex-col justify-center items-center text-center p-4 md:p-8 gap-2 md:gap-4">
	<h1 class="text-5xl md:text-7xl font-mono font-bold">SVERMINAL</h1>
	<h3 class="text-sm md:text-base font-mono">Terminal emulator built on Svelte and Tailwind</h3>

    <div class="w-full p-4">
        <Sverminal processor={processCommand} writer={sverminalWriter} />
    </div>
    
    <div class="w-full p-4 text-left">
        <h3 class="text-xl ">Demo Commands</h3>
        <ul class="list-disc py-4 px-8">
            <li>echo &lt;message&gt;</li>
            <li>warn &lt;message&gt;</li>
            <li>error &lt;message&gt;</li>
            <li>info &lt;message&gt;</li>
            <li>countdown &lt;number&gt; where number is a positive integer between 0 and 100</li>
        </ul>

    </div>
</div>


