import type { SverminalReader } from "$lib/reader/reader.js";
import type { SverminalWriter } from "$lib/writer/writer.js";
import { SubProgram, type ProgramParamters } from "./program.js";

export class DemoSplitProgram extends SubProgram {
    constructor(reader: SverminalReader,  writer: SverminalWriter){
        const params: ProgramParamters = {
			name: 'split-demo',
			prompt: 'split-demo',
            run: 'split',
            exit: 'exit',
            welcome: 'Welcome to the split screen demo! This UI layout allows user defined text content to be displayed in the top window. Type \'exit\' to stop the program.',
            farewell: 'Thank you for using the split screen demo. Goodbye!',
		};
        super(params, reader, writer);
    }

    async processCommand(_command: string): Promise<void> {
        this.writer.echo('Apologies! This program doesn\'t handle any user input and is only designed to showcase a UI layout.');
    }
}