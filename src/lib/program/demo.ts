import type { SverminalWriter } from "$lib/writer/writer.js";
import type { IProgram } from "./program.js";

export class DemoProgram implements IProgram {
    exitCommand: string = 'exit';
    promptPrefix: string = 'demo';
    welcomeMessage?: string = 'Welcome to the demo program! All commands will result in \'Hello World!\''

    writer: SverminalWriter;

    constructor(writer: SverminalWriter){
        this.writer = writer;
    }

    async processCommand(_command: string): Promise<void> {
        this.writer.echo('Hello World!');
    }
}