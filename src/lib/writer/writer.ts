import { writable } from 'svelte/store';

export enum SverminalResponseType {
	ECHO = 0,
	WARNING,
	ERROR,
	INFO, 
    FREEFORM, //Style and newlines are left to the user to define.
}

export interface SverminalResponse {
	type: SverminalResponseType;
	message: string;
    styles?: string[];
}

export class SverminalWriter {
	readonly store = writable<SverminalResponse>();

	subscribe(callback: (value: SverminalResponse) => void) {
		this.store.subscribe(callback);
	}

    write(message: string, styles?: string[]){
        this.store.set({
			type: SverminalResponseType.FREEFORM,
			message,
            styles
		});
    }

	echo(message: string) {
		this.store.set({
			type: SverminalResponseType.ECHO,
			message
		});
	}

	warn(message: string) {
		this.store.set({
			type: SverminalResponseType.WARNING,
			message
		});
	}

	error(message: string) {
		this.store.set({
			type: SverminalResponseType.ERROR,
			message
		});
	}

	info(message: string) {
		this.store.set({
			type: SverminalResponseType.INFO,
			message
		});
	}
}
