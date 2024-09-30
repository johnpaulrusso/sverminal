<script lang="ts">
	import '../app.css';
	import Sverminal from '$lib/Sverminal.svelte';
	import customConfig from '$lib/sverminal.config.js';
	import { DemoProgram } from '$lib/program/demo.js';

	let demoProgram: DemoProgram = new DemoProgram();
</script>

<div class="w-full flex flex-col justify-center items-center text-center p-4 md:p-8 gap-2 md:gap-4">
	<h1 class="text-5xl md:text-7xl font-mono font-bold">SVERMINAL</h1>
	<h3 class="text-sm md:text-base font-mono">Terminal emulator built on Svelte and Tailwind</h3>

	<div class="w-full h-[500px] px-4 pt-4">
		<Sverminal program={demoProgram} config={customConfig} />
	</div>

	<div class="w-full px-4 text-left">
		<h3 class="text-xl py-4">
			Demo Commands - <a
				class="w-full text-left text-xl font-medium text-blue-600 dark:text-blue-500 hover:underline"
				href="https://github.com/johnpaulrusso/sverminal?tab=readme-ov-file#readme">Documentation</a
			>
		</h3>
		<div class="overflow-hidden rounded-md border border-gray-300">
			<table class="min-w-full bg-white text-sm md:text-base">
				<tr class="w-full bg-gray-100">
					<th class="py-2 px-4 border-b border-gray-300 text-left text-gray-600 font-semibold"
						>Command/Input</th
					>
					<th class="py-2 px-4 border-b border-gray-300 text-left text-gray-600 font-semibold"
						>Arguments</th
					>
					<th class="py-2 px-4 border-b border-gray-300 text-left text-gray-600 font-semibold"
						>Description</th
					>
				</tr>
				<tr>
					<td class="py-2 px-4 border-b border-gray-300">Enter key</td>
					<td class="py-2 px-4 border-b border-gray-300">N/A</td>
					<td class="py-2 px-4 border-b border-gray-300">Submit current command or input.</td>
				</tr>
				<tr>
					<td class="py-2 px-4 border-b border-gray-300">Up/Down arrows keys</td>
					<td class="py-2 px-4 border-b border-gray-300">N/A</td>
					<td class="py-2 px-4 border-b border-gray-300">Navigate command history.</td>
				</tr>
				<tr>
					<td class="py-2 px-4 border-b border-gray-300">echo</td>
					<td class="py-2 px-4 border-b border-gray-300">message &lt;string&gt;</td>
					<td class="py-2 px-4 border-b border-gray-300"
						>Prints the message back to the terminal.</td
					>
				</tr>
				<tr>
					<td class="py-2 px-4 border-b border-gray-300">warn</td>
					<td class="py-2 px-4 border-b border-gray-300">message &lt;string&gt;</td>
					<td class="py-2 px-4 border-b border-gray-300"
						>Prints a warning message back to the terminal.</td
					>
				</tr>
				<tr>
					<td class="py-2 px-4 border-b border-gray-300">error</td>
					<td class="py-2 px-4 border-b border-gray-300">message &lt;string&gt;</td>
					<td class="py-2 px-4 border-b border-gray-300"
						>Prints an error message back to the terminal.</td
					>
				</tr>
				<tr>
					<td class="py-2 px-4 border-b border-gray-300">info</td>
					<td class="py-2 px-4 border-b border-gray-300">message &lt;string&gt;</td>
					<td class="py-2 px-4 border-b border-gray-300"
						>Prints an info message back to the terminal.</td
					>
				</tr>
				<tr>
					<td class="py-2 px-4 border-b border-gray-300">countdown</td>
					<td class="py-2 px-4 border-b border-gray-300">1-99 &lt;number&gt;</td>
					<td class="py-2 px-4 border-b border-gray-300"
						>Counts down from the provided number every seconds and prints the value to the
						terminal.</td
					>
				</tr>
				<tr>
					<td class="py-2 px-4 border-b border-gray-300">freeform-demo</td>
					<td class="py-2 px-4 border-b border-gray-300">None</td>
					<td class="py-2 px-4 border-b border-gray-300"
						>Prints out block of text that demostrates the ability to mix styles.</td
					>
				</tr>
				<tr>
					<td class="py-2 px-4 border-b border-gray-300">input-demo</td>
					<td class="py-2 px-4 border-b border-gray-300">None</td>
					<td class="py-2 px-4 border-b border-gray-300"
						>Demonstrates the ability to request additional user input while processing a command.</td
					>
				</tr>
			</table>
		</div>
	</div>
</div>
