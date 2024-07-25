import { writable } from 'svelte/store';

export enum SverminalResponseType {
	ECHO = 0,
	WARNING,
	ERROR,
	INFO //TODO
}

export interface SverminalResponse {
	type: SverminalResponseType;
	message: string;
}

export class SverminalWriter {
	readonly store = writable<SverminalResponse>();

	subscribe(callback: (value: SverminalResponse) => void) {
		this.store.subscribe(callback);
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
