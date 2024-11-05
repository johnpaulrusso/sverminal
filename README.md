# README

Sverminal is a Svelte component that provides a terminal emulator to be used in the browser. This component relies on Tailwind CSS for its styling.

Try out the [Live Demo!](https://sverminal.io/demo)
<br>

### Prerequisites

Svelte and Tailwind CSS installed in your project.
<br>

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
};
```
<br>

### Example Usage
 Simply pass a command handler callback to the Sverminal component.
```html
<script lang="ts">
	import Sverminal from 'sverminal';

	async function processor(command: string): Promise<void> {
		// Your command processing logic here
	}
</script>
```

```html
<Sverminal {processor}/>
```
<br>

### Configuration
Consumers of the Sverminal component can optionally provide a custom configuration. All properties are optional and if omitted will fallback to defaults values. For convenience, all examples below showcase the default values.

```html
<Sverminal {processor} config={myConfiguration}/>
```

#### Styles
Each property in the style object accepts a list of CSS classes that will be applied to the relevant text elements.

```javascript
const myConfiguration = {
    style: {
        prompt: ['text-emerald-400'], //Ex: 'sverminal>'
        command: ['text-violet-400'], //The first word of user input
        flags: ['text-slate-400'], //Arguments prefixed with '-'
        info: ['text-cyan-400'],
        error: ['text-red-400'],
        warn: ['text-yellow-400'], 
        text: ['text-slate-50'] //Everything else...
    }
}
```

#### Command History
By default Sverminal will keep track of a users command history in memory. This can be disabled or further configured within a custom configuration. The limit property puts a cap on the number of unique commands tracked in the specified history method. When the cap is reached, newer commands will replace the oldest commands in history.

```javascript
const myConfiguration = {
    history: {
        enabled: true,
        method: 'memory', //memory (default), sessionstorage, localstorage
        limit: 10
    },
}
```

#### Misc
Here are some additional configuration options that you find useful...
```javascript
const myConfiguration = {
    promptSuffix: '>', //The characters to place at the end of the prompt.
    newlineBetweenCommands: false, //If set to true, an extra line will be appended after submitting a command.
    quoteMultiWordAutoCompletes: true //Optionally wrap multi-word auto-completes with quotes.
}
```

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
<br>

### Writing to the Terminal
The SverminalWriter class provides library users with the ability to write content back to the terminal. This could be for used for anything from simply printing error messages to the user when a command fails or developing a complex text-based user interface.

#### API
The writer API is pretty simple. The echo, error, warn, and info functions writer their respective output to the terminal as independent lines or block display. The write and writeLink functions writer their output inline which provides the client more flexibility when it is desired to output more complex content.

```javascript
writer.echo('Echo some text');
writer.warn('Print a warning');
writer.error('Print an error');
writer.info('Print some information')
writer.write('This text will be inline and green.', ['text-green-500']);
writer.writeLink('Sverminal!', 'https://sverminal.io', ['text-purple-500']);
writer.clear() //Clears all terminal content.
```
#### Example
Here is a minimal example of setting up a writer to simply echo the command back to the user.
```javascript
<script lang="ts">
    import { Sverminal, SverminalWriter } from 'sverminal';

    let writer = new SverminalWriter();

    async function processor(command: string): Promise<void> {
        // Example: echo the command back to the terminal.
        writer.echo(command);
    }
</script>
```
```html
<Sverminal {processor} {writer}/>
```
<br>

#### Requesting Additional User Input
Some of your commands may require users to enter additional input. The SverminalReader class was created to accomplish this use case. Use it within the command handling function to await additional input from the user.

#### Example
Here is a minimal example of setting up a reader to request additional user input needed to process a command.

```javascript
<script lang="ts">
    import { Sverminal, SverminalReader } from 'sverminal';

    let reader = new SverminalReader();

    async function processor(command: string): Promise<void> {
        // Example: any command will prompt the user for their name.
        let name = await reader.read("What is your name?");
    }
</script>
```
```html
<Sverminal {processor} {reader}/>
```

<br>


### Autocomplete
To enable users to operate quickly and efficiently within user-defined terminal programs, Sverminal accepts a property called autoCompletes. This property accepts a list of strings that are potential autocomplete options that automatically populate onto the prompt when the user presses the TAB key. This property can be updated with different string lists as the user interacts with the terminal.

#### Example
Here is an example of what the autoCompletes property might be set to in a simple calculator program. Upon pressing the TAB key, the user can iterate through the commands based on existing characters already typed into the prompt.

```javascript
<script lang="ts">
    import { Sverminal } from 'sverminal';

    let autoCompletes = ['add', 'subtract', 'multiply', 'divide'];

    async function processor(command: string): Promise<void> {
        //Your processing logic here;
    }
</script>
```

#### Advanced
If you want to change the auto complete options dynamically while the user is entering a command, the component provides an event 'get-current-command'. This fires each time the user types something into the prompt and provides the active contents of the command so far.

```html
<Sverminal {processor} {autoCompletes} on:get-current-command={getCurrentCommand}/>
```
<br>

### Development

Run the demo locally.

```
npm run dev
```

