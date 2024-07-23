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
			return;
		}
	}
</script>

<h1>Welcome to the Sverminal demo</h1>
<!--
<div class="p-4">
<Sverminal {processCommand} />
</div>-->
<div class="p-4">
	<Sverminal {processCommand} />
</div>
