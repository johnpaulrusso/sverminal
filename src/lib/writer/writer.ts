import { writable } from 'svelte/store';

export enum SverminalResponseType {
	ECHO = 0,
	WARNING,
	ERROR,
	INFO,
	FREEFORM, //Style and newlines are left to the user to define.
	CLEAR //Clear all responses!
}

export enum SverminalResponseTarget {
	TERMINAL = 0,
	SPLIT = 1
}

export interface SverminalResponse {
	type: SverminalResponseType;
	message: string;
	styles?: string[];
	target?: SverminalResponseTarget;
}

export class SverminalWriter {
	readonly store = writable<SverminalResponse>();

	subscribe(callback: (value: SverminalResponse) => void) {
		this.store.subscribe(callback);
	}

	write(message: string, styles?: string[], target?: SverminalResponseTarget) {
		this.store.set({
			type: SverminalResponseType.FREEFORM,
			message,
			styles,
			target
		});
	}

	echo(message: string, target?: SverminalResponseTarget) {
		this.store.set({
			type: SverminalResponseType.ECHO,
			message,
			target
		});
	}

	warn(message: string, target?: SverminalResponseTarget) {
		this.store.set({
			type: SverminalResponseType.WARNING,
			message,
			target
		});
	}

	error(message: string, target?: SverminalResponseTarget) {
		this.store.set({
			type: SverminalResponseType.ERROR,
			message,
			target
		});
	}

	info(message: string, target?: SverminalResponseTarget) {
		this.store.set({
			type: SverminalResponseType.INFO,
			message,
			target
		});
	}

	clear(target?: SverminalResponseTarget) {
		this.store.set({
			type: SverminalResponseType.CLEAR,
			message: '',
			target
		});
	}
}
