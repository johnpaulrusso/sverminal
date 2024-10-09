import { AutoCompleter } from '$lib/autocomplete/autocomplete.js';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';

const autoCompleter: AutoCompleter = new AutoCompleter();
const mockOptions = ['start', 'stop', 'pause', 'rewind', 'fast forward'];

describe('auto completer tests without options', () => {
	it('auto completer returns empty', () => {
		expect(autoCompleter.getNextOption('')).toBe('');
	});

	it('auto completer returns empty', () => {
		expect(autoCompleter.getNextOption('st')).toBe('');
	});
});

describe('auto completer tests with options', () => {
	beforeEach(() => {
		autoCompleter.reset();
		autoCompleter.setOptions(mockOptions);
	});

	it('auto completer returns first option alphabetically sorted.', () => {
		expect(autoCompleter.getNextOption('')).toBe('fast forward');
	});

	it('auto completer returns option', () => {
		expect(autoCompleter.getNextOption('p')).toBe('pause');
	});

	it('auto completer iterates through options with empty input', () => {
		expect(autoCompleter.getNextOption('')).toBe('fast forward');
		expect(autoCompleter.getNextOption('')).toBe('pause');
		expect(autoCompleter.getNextOption('')).toBe('rewind');
		expect(autoCompleter.getNextOption('')).toBe('start');
		expect(autoCompleter.getNextOption('')).toBe('stop');
		expect(autoCompleter.getNextOption('')).toBe('fast forward');
	});

	it('auto completer iterates through options with input', () => {
		expect(autoCompleter.getNextOption('st')).toBe('start');
		expect(autoCompleter.getNextOption('st')).toBe('stop');
	    expect(autoCompleter.getNextOption('st')).toBe('start');
	});

    it('auto completer returns empty for unknown option', () => {
		expect(autoCompleter.getNextOption('abc')).toBe('');
	});

    it('auto completer resets index when input changes', () => {
		expect(autoCompleter.getNextOption('')).toBe('fast forward');
		expect(autoCompleter.getNextOption('')).toBe('pause');
		expect(autoCompleter.getNextOption('')).toBe('rewind');
		expect(autoCompleter.getNextOption('abc')).toBe('');
		expect(autoCompleter.getNextOption('')).toBe('fast forward');
	});
});
