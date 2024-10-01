import { SverminalReader } from '$lib/reader/reader.js';
import { SverminalWriter } from '$lib/writer/writer.js';

export interface ProgramParamters {
	name: string;
	prompt: string;

	run?: string;
	exit?: string;

	welcome?: string;
	farewell?: string;
}

interface PrivateProgramParamters extends ProgramParamters {
	isRoot: boolean;
}

abstract class Program {
	readonly params: PrivateProgramParamters;

	readonly reader: SverminalReader;
	readonly writer: SverminalWriter;

	private programs: Program[];
	private activeProgram: Program;
	private callerProgram: Program;

	constructor(params: PrivateProgramParamters, reader: SverminalReader, writer: SverminalWriter) {
		this.params = params;
		this.reader = reader;
		this.writer = writer;
		this.programs = [];
		this.activeProgram = this;
		this.callerProgram = this;
	}

	async processor(command: string): Promise<void> {
		let exitProgram = this.programs.find((p) => p.params.exit === command);
		let runProgram = this.programs.find((p) => p.params.run === command);

		if (runProgram) {
			this.callerProgram = this;
			this.activeProgram = runProgram;
			//TODO: ON ENTRY!
			return;
		}

		if (exitProgram) {
			//TODO: ON EXIT!
			this.activeProgram = this.callerProgram;
		}

		await this.activeProgram.processCommand(command);
	}

	abstract processCommand(command: string): Promise<void>;

	installProgram(program: Program) {
		this.programs.push(program);
	}
}

export abstract class MainProgram extends Program {
	constructor(params: ProgramParamters) {
		const reader: SverminalReader = new SverminalReader();
		const writer: SverminalWriter = new SverminalWriter();
		const privateParams: PrivateProgramParamters = params as PrivateProgramParamters;
		privateParams.isRoot = true;
		super(privateParams, reader, writer);
	}
}

export abstract class SubProgram extends Program {
	constructor(params: ProgramParamters, reader: SverminalReader, writer: SverminalWriter) {
		const privateParams: PrivateProgramParamters = params as PrivateProgramParamters;
		privateParams.isRoot = false;
		super(privateParams, reader, writer);
	}
}
