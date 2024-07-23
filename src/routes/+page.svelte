<script lang="ts">
	import '../app.css';
	import Sverminal from '$lib/Sverminal.svelte';

	async function processCommand(command: string): Promise<string> {
		// Your command processing logic here
		console.log('Processing command from parent component:', command);

		//First we should break the command up into pieces.
		const commandParts: string[] = command.split(' ');

		if (commandParts.length == 0) {
			return '';
		}

		const method = command.at(0);
		const args = commandParts.length > 0 ? commandParts.slice(1) : [];

		if (method === 'help') {
		} else if (method === 'error') {
			return 'You have run he error command! Here is some error text!';
		} else {
			return 'Unknown command!';
		}

		// Simulate command processing with a delay
		return new Promise((resolve) => setTimeout(resolve, 1000));
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
