<script lang="ts">
	import '../app.css';
	import Sverminal from '$lib/Sverminal.svelte';
	import { SverminalWriter } from '$lib/writer/writer.js';
    import customConfig from '$lib/sverminal.config.js';

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

    function printStylesExample(){
        const text = 'Style';
        sverminalWriter.write('|-----------------------------|');
        sverminalWriter.write('\n');
        sverminalWriter.write('|     ');
        sverminalWriter.write(` Red  `, ['text-red-500']);
        sverminalWriter.write(' ')
        sverminalWriter.write(`Green `, ['text-green-500']);
        sverminalWriter.write(' ')
        sverminalWriter.write(` Blue`, ['text-blue-500']);
        sverminalWriter.write('     |');
        sverminalWriter.write('\n');
        sverminalWriter.write('|-----------------------------|');
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
        } else if (method === 'freeform-demo') {
            printStylesExample();
		} else {
			sverminalWriter.error(`${method} is not recognized as a valid command.`);
		}
	}
</script>

<div class="w-full flex flex-col justify-center items-center text-center p-4 md:p-8 gap-2 md:gap-4">
	<h1 class="text-5xl md:text-7xl font-mono font-bold">SVERMINAL</h1>
	<h3 class="text-sm md:text-base font-mono">Terminal emulator built on Svelte and Tailwind</h3>

    <div class="w-full px-4 pt-4">
        <Sverminal 
            processor={processCommand} 
            writer={sverminalWriter} 
            promptPrefix="sverminal" 
            config={customConfig} 
        />
    </div>
    
    <div class="w-full px-4 text-left">
        <h3 class="text-xl py-4">Demo Commands - <a class="w-full text-left text-xl font-medium text-blue-600 dark:text-blue-500 hover:underline" 
            href="https://github.com/johnpaulrusso/sverminal?tab=readme-ov-file#readme">Documentation</a></h3>
            <div class="overflow-hidden rounded-md border border-gray-300">
        <table class="min-w-full bg-white text-sm md:text-base">
            
            <tr class="w-full bg-gray-100">
                <th class="py-2 px-4 border-b border-gray-300 text-left text-gray-600 font-semibold">Command</th>
                <th class="py-2 px-4 border-b border-gray-300 text-left text-gray-600 font-semibold">Arguments</th>
                <th class="py-2 px-4 border-b border-gray-300 text-left text-gray-600 font-semibold">Description</th>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b border-gray-300">echo</td>
                <td class="py-2 px-4 border-b border-gray-300">message &lt;string&gt;</td>
                <td class="py-2 px-4 border-b border-gray-300">Prints the message back to the terminal.</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b border-gray-300">warn</td>
                <td class="py-2 px-4 border-b border-gray-300">message &lt;string&gt;</td>
                <td class="py-2 px-4 border-b border-gray-300">Prints a warning message back to the terminal.</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b border-gray-300">error</td>
                <td class="py-2 px-4 border-b border-gray-300">message &lt;string&gt;</td>
                <td class="py-2 px-4 border-b border-gray-300">Prints an error message back to the terminal.</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b border-gray-300">info</td>
                <td class="py-2 px-4 border-b border-gray-300">message &lt;string&gt;</td>
                <td class="py-2 px-4 border-b border-gray-300">Prints an info message back to the terminal.</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b border-gray-300">freeform-demo</td>
                <td class="py-2 px-4 border-b border-gray-300">None</td>
                <td class="py-2 px-4 border-b border-gray-300">Prints out block of text that demostrates the ability to mix styles.</td>
            </tr>
            <tr>
                <td class="py-2 px-4 border-b border-gray-300">countdown</td>
                <td class="py-2 px-4 border-b border-gray-300">1-99 &lt;number&gt;</td>
                <td class="py-2 px-4 border-b border-gray-300">Counts down from the provided number every seconds and prints the value to the terminal.</td>
            </tr>
        </table>
    </div>
    </div>
</div>


