<script lang="ts">
	import '../app.css';
	import Sverminal from '$lib/Sverminal.svelte';
	import { responseStream, SverminalResponseType } from '$lib/Stores.js';

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
		} else if (method === 'echo') {
			responseStream.set({
				type: SverminalResponseType.ECHO,
				message: 'This message is part of the echo test! TODO - only respond with args!'
			});
		} else if (method === 'warn') {
			responseStream.set({
				type: SverminalResponseType.WARNING,
				message: 'This warning is an intential result of the warn command test!'
			});
		} else if (method === 'error') {
			responseStream.set({
				type: SverminalResponseType.ERROR,
				message: 'This error is an intential result of the error command test!'
			});
		} else if (method === 'info') {
			responseStream.set({
				type: SverminalResponseType.INFO,
				message: 'This message is part of the info test!'
			});
		} else {
			responseStream.set({
				type: SverminalResponseType.ERROR,
				message: `${method} is not recognized as a valid command.`
			});
		}
	}
</script>

<div class="w-full flex flex-col justify-center items-center text-center p-4 md:p-8 gap-2 md:gap-4">
    <h1 class="text-5xl md:text-7xl font-mono font-bold">SVERMINAL</h1>
    <h3 class="text-sm md:text-base font-mono">Terminal emulator built on Svelte and Tailwind</h3>
</div>

<!--
<div class="p-4">
<Sverminal {processCommand} />
</div>-->
<div class="p-4">
	<Sverminal {processCommand} />
</div>
