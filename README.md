# Example Usage

```typescript
import Sverminal from 'sverminal';
import { SverminalWriter } from 'sverminal/writer';

let writer = new SverminalWriter();

async function processCommand(command: string): Promise<void> {
  // Your command processing logic here

  // Example: echo the command back to the terminal.
  writer.echo(command);
}
```

```svelte
<Sverminal {processCommand} {writer} />
```
