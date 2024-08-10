# README
Sverminal is a Svelte component that provides an terminal emulator to be used in the browser. This component relies on Tailwind CSS for its styling.

Try out the [Live Demo!](https://sverminal.io)

### Prerequisites
Svelte and Tailwind CSS installed in your project.

### Installation
Step 1: Install the sverminal npm package.
```bash
npm install sverminal
```

Step 2: Add the sverminal package source files to your Tailwind CSS configuration file.

```javascript
export default {
	content: [
            './src/**/*.{html,js,ts,svelte}', 
            './node_modules/sverminal/dist/**/*.{html,js,ts,svelte}'
    ]
}
```

### Example Usage

```html
<script lang="ts">
    import Sverminal from 'sverminal';
    import { SverminalWriter } from 'sverminal/writer';

    //Optionally import a custom configuration.
    import customConfig from '$lib/sverminal.config.js';

    //Use the writer to output text to the terminal.
    let writer = new SverminalWriter();

    async function processor(command: string): Promise<void> {
        // Your command processing logic here

        // Example: echo the command back to the terminal.
        writer.echo(command);
    }
</script>
```

```html
<Sverminal 
    processor={processCommand} 
    writer={sverminalWriter} 
    promptPrefix="sverminal" 
    config={customConfig} 
/>
```

#### Requestion Additional User Input
Sverminal also provides a mechanism for requestion additional user input while processing a command. 

```javascript
import { SverminalReader } from '$lib/reader/reader.js';
let sverminalReader = new SverminalReader();

async function processCommand(command: string): Promise<void> {
    ...

    let name = "";
    await sverminalReader.read("What is your name?").then((value: string) => {
        name = value;
    });

    ...
}
```

### Configuration

```javascript
const customConfig = {
	promptSuffix: '>',
	style: {
        //Arrays of CSS classes to be applied to each type of text.
		prompt: ['text-emerald-400', 'font-bold'],
		command: ['text-violet-400'],
		flags: ['text-slate-400'], //Any argument prefixed by a '-' is considered a flag.
		info: ['text-cyan-400'],
		error: ['text-red-400'],
		warn: ['text-yellow-400'],
		text: ['text-slate-50']
	},
	history: {
		enabled: true,
		method: 'memory', //memory (default), sessionstorage, localstorage
		limit: 10 //Max number of history entries.
	},
	newlineBetweenCommands: false //Set this to true if you want an extra line between commands.
};
export default customConfig;
```
