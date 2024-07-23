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

export let responseStream = writable<SverminalResponse>();
