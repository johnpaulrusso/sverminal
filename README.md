# README
Sverminal is a Svelte component that provides an terminal emulator to be used in the browser. This component relies on Tailwind CSS for its styling.

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

    //Use the writer to output text to the terminal.
    let writer = new SverminalWriter();

    async function processor(command: string): Promise<void> {
        // Your command processing logic here

        // Example: echo the command back to the terminal.
        writer.echo(command);
    }
</script>
```

```svelte
<Sverminal {processor} {writer}/>
```
