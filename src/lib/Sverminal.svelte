<script context="module" lang="ts">
	export enum CommandIndex {
		PROMPT = 0,
		COMMAND,
		ARGS
	}
</script>

<script lang="ts">
	import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
	import { defaultConfig, type Config } from '$lib/config/defaultConfig.js';
	import { createCommandHistory } from '$lib/history/factory.js';
	import {
		SverminalResponseTarget,
		SverminalResponseType,
		type SverminalResponse,
		type SverminalWriter
	} from './writer/writer.js';
	import { SverminalUserSpan, SverminalPromptSpan, SpanPosition } from './core/span.js';
	import type { SverminalReader } from './reader/reader.js';
	import VerticalSplitLayout from './VerticalSplitLayout.svelte';
	import type { CommandHistoryStrategy } from './history/commandhistorystrategy.js';
	import { AutoCompleter } from './autocomplete/autocomplete.js';
	import * as utils from './utils/utils.js';

	const dispatch = createEventDispatcher();

	export let processor: (command: string) => Promise<void>;
	export let promptPrefix = 'sverminal';
	export let config: Config = defaultConfig;
	export let writer: SverminalWriter;
	export let reader: SverminalReader;

	/**
	 * Optionally pass in a list of strings that will 'auto-complete' when the user presses the TAB key.
	 */
	export let autoCompletes: string[] = [];
	const autoCompleter: AutoCompleter = new AutoCompleter();
	let cachedInput: string | undefined = undefined;

	$: promptText = `${promptPrefix}${config.promptSuffix}`;
	$: autoCompleter.setOptions(autoCompletes);

	const ZERO_WIDTH_SPACE_REGEX: RegExp = /\u200B/g;

	let sverminalDiv: HTMLDivElement;
	let workingCommandLineDiv: HTMLDivElement;
	let workingChildIndex: number = CommandIndex.COMMAND;
	let historyIndex = -1;
	let userSpans: SverminalUserSpan[] = [];
	let commandInProgress = false;
	let commandHistory: CommandHistoryStrategy;
	let workingReaderSpan: SverminalUserSpan;

	//TOP/SPLIT VIEW
	export let enableUI: boolean = false;
	let sverminalUiDiv: HTMLDivElement;

	async function handleCommand(command: string) {
		try {
			commandInProgress = true;
			await processor(command);
		} catch (error) {
			appendError(`Failed to process command: ${command} - Error: ${error}`, sverminalDiv);
		} finally {
			if (config.newlineBetweenCommands) {
				appendEmptyLine();
			}
			appendNewCommandLine();

			//Regardless of the result, save the command in history if it is a new command.
			const lastCommand = commandHistory.get(0);
			if (command != lastCommand) {
				commandHistory.push(command);
			}
			commandInProgress = false;
		}
	}

	function appendContent(
		elementType: string,
		content: string,
		styles: string[],
		target: HTMLDivElement,
		decorate?: (element: HTMLElement) => void
	) {
		let contentElement = document.createElement(elementType);
		contentElement.setAttribute('contenteditable', 'false');
		contentElement.classList.add(...styles);
		contentElement.innerHTML = `${content}`;
		contentElement.onclick = (e) => {
			e.stopPropagation();
			if (!utils.selectionHasNonZeroRange()) {
				placeCursorAtWorkingIndex();
			}
		};

		if (decorate) {
			decorate(contentElement);
		}

		target.appendChild(contentElement);
		target.scrollTop = target.scrollHeight;
	}

	function appendEmptyLine() {
		appendContent('div', ' ', config.style.text, sverminalDiv);
	}

	function appendEcho(message: string, target: HTMLDivElement) {
		appendContent('div', message, config.style.text, target);
	}

	function appendWarn(message: string, target: HTMLDivElement) {
		appendContent('div', message, config.style.warn, target);
	}

	function appendError(message: string, target: HTMLDivElement) {
		appendContent('div', message, config.style.error, target);
	}

	function appendInfo(message: string, target: HTMLDivElement) {
		appendContent('div', message, config.style.info, target);
	}

	function appendFreeform(message: string, styles: string[], target: HTMLDivElement) {
		appendContent('span', message, styles, target);
	}

	function appendFreeformAnchor(
		message: string,
		url: string,
		styles: string[],
		target: HTMLDivElement
	) {
		appendContent('a', message, styles, target, (e: HTMLElement) => {
			e.setAttribute('href', url);
		});
	}

	function appendPrompt() {
		const promptSpan = new SverminalPromptSpan(promptText, config.style.prompt);
		workingCommandLineDiv.appendChild(promptSpan.element());
	}

	function appendCommand(command: string = '') {
		let commandSpan = new SverminalUserSpan(config.style.command, command);
		workingCommandLineDiv.appendChild(commandSpan.element());
		userSpans.push(commandSpan);
	}

	function placeCursorAtWorkingIndex(start: boolean = false) {
		if (workingChildIndex >= workingCommandLineDiv.children.length) {
			console.error('Failed to place cursor in Sverminal!');
			return;
		}

		let span = userSpans[workingChildIndex - 1];
		if (start) {
			span.placeCursorAtUserStart();
		} else {
			span.placeCursorAtEnd();
		}
	}

	function appendNewCommandLine() {
		userSpans = [];

		workingCommandLineDiv = document.createElement('div');
		workingCommandLineDiv.setAttribute('contenteditable', 'true');
		workingCommandLineDiv.classList.add('focus:outline-none');
		workingCommandLineDiv.onclick = (event) => {
			event.stopPropagation();
			if (!utils.selectionHasNonZeroRange()) {
				placeCursorAtWorkingIndex();
			}
		};

		appendPrompt();
		appendCommand();

		sverminalDiv.appendChild(workingCommandLineDiv);

		workingChildIndex = CommandIndex.COMMAND;
		placeCursorAtWorkingIndex();

		sverminalDiv.scrollTop = sverminalDiv.scrollHeight;
	}

	function appendNewArg(arg: string = '') {
		let argSpan = new SverminalUserSpan(config.style.text, arg);

		workingChildIndex++;
		if (workingChildIndex >= workingCommandLineDiv.children.length) {
			workingCommandLineDiv.appendChild(argSpan.element());
			userSpans.push(argSpan);
			placeCursorAtWorkingIndex();
		} else {
			userSpans = [
				...userSpans.slice(0, workingChildIndex - 1),
				argSpan,
				...userSpans.slice(workingChildIndex - 1)
			];
			workingCommandLineDiv.insertBefore(
				argSpan.element(),
				workingCommandLineDiv.children[workingChildIndex]
			);
			placeCursorAtWorkingIndex(true);
		}
	}

	function removeWorkingArg() {
		if (workingChildIndex < CommandIndex.ARGS) {
			console.warn('sverminal tried to remove the command span.');
			return;
		}

		const span = userSpans[workingChildIndex - 1];
		userSpans.splice(workingChildIndex - 1, 1);

		workingCommandLineDiv.removeChild(span.element());
		workingChildIndex--;

		placeCursorAtWorkingIndex();
	}

	function decrementWorkingArg() {
		workingChildIndex--;
		placeCursorAtWorkingIndex();
	}

	function incrementWorkingArg() {
		workingChildIndex++;
		placeCursorAtWorkingIndex(true);
	}

	function splitWorkingSpan() {
		const span = userSpans[workingChildIndex - 1];
		const newArgText = span.split();
		appendNewArg(newArgText);
	}

	function joinCurrentChildWithPreviousChild() {
		const srcSpan = userSpans[workingChildIndex - 1];
		const dstSpan = userSpans[workingChildIndex - 2];
		const text = srcSpan.text();
		const offset = dstSpan.length();

		removeWorkingArg(); //This should out the cursor in the correct location.

		dstSpan.append(text);
		dstSpan.placeCursor(offset);
	}

	function insertSimulatedSpace() {
		if (!performSpace()) {
			//We need to specifically handle this case.
			const span = userSpans[workingChildIndex - 1];
			span.insertAtCursorPosition(' ');
		}
	}

	function splitStringWithSpacesAndTabs(input: string): string[] {
		const regex = /\S+|[ \u0009]/g;
		const result = input.match(regex);
		return result ? result : [];
	}

	function insertText(text: string) {
		if (reader != null && reader.isReading && workingReaderSpan != null) {
			workingReaderSpan.append(text);
			workingReaderSpan.placeCursorAtEnd();
			return;
		}

		const selection = window.getSelection();
		const range = selection?.getRangeAt(0);
		if (!range) {
			return;
		}

		const textparts = splitStringWithSpacesAndTabs(text);

		textparts.forEach((part: string, index, arr) => {
			const span = userSpans[workingChildIndex - 1];
			if (part === ' ' || part === '\u0009') {
				insertSimulatedSpace();
			} else {
				span.insertAtCursorPosition(part);
			}
		});
	}

	function lockCommand() {
		workingCommandLineDiv.setAttribute('contenteditable', 'false');
		Array.from(workingCommandLineDiv.children).forEach((childspan: Element, index: number) => {
			if (index >= CommandIndex.COMMAND) {
				childspan.setAttribute('contenteditable', 'false');
			}
		});
	}

	function formatArgs() {
		Array.from(workingCommandLineDiv.children).forEach((childspan: Element, index: number) => {
			if (index >= CommandIndex.ARGS) {
				if (childspan.innerHTML.replace(ZERO_WIDTH_SPACE_REGEX, '').trim().startsWith('-')) {
					childspan.classList.add(...config.style.flags);
					childspan.classList.remove(...config.style.text);
				} else {
					childspan.classList.add(...config.style.text);
					childspan.classList.remove(...config.style.flags);
				}
			}
		});
	}

	function navigateHistory(reverse: boolean = false) {
		if (
			(reverse && historyIndex == 0) ||
			(!reverse && historyIndex >= commandHistory.length() - 1)
		) {
			return;
		} else if (reverse) {
			--historyIndex;
		} else {
			++historyIndex;
		}

		let historicalCommand = commandHistory.get(historyIndex);

		if (historicalCommand === '') {
			return;
		}

		//Clear the command! This should probably be its own function.
		for (; workingChildIndex > 0; --workingChildIndex) {
			let childToRemove = workingCommandLineDiv.children.item(workingChildIndex);
			if (childToRemove) {
				workingCommandLineDiv.removeChild(childToRemove);
			}
		}
		userSpans = [];
		workingChildIndex = CommandIndex.COMMAND;
		appendCommand();
		placeCursorAtWorkingIndex();
		insertText(historicalCommand);
		formatArgs();
	}

	function onKeyDownEnter(event: KeyboardEvent) {
		historyIndex = -1;
		// ENTER - Command Handling
		event.preventDefault(); // Prevent default new line behavior

		if (!commandInProgress) {
			const command = getCurrentCommand();
			lockCommand();
			if (command) {
				handleCommand(command);
			} else {
				appendNewCommandLine();
			}
		} else if (reader.isReading) {
			workingReaderSpan.lock();
			reader.response = getCurrentReaderInput();
		}
	}

	/**
	 * SPACE - Create new arguments. This may involve splitting existing commands/args.
	 */
	function onKeyDownSpace(event: KeyboardEvent) {
		historyIndex = -1;

		if (reader.isReading) {
			return;
		} else if (performSpace()) {
			event.preventDefault();
		}
	}

	function performSpace(): boolean {
		const span = userSpans[workingChildIndex - 1];
		let preventDefault = false;
		if (span.populated()) {
			if (span.position() === SpanPosition.MIDDLE) {
				preventDefault = true;
				splitWorkingSpan(); //TODO
				placeCursorAtWorkingIndex(true);
			} else if (span.position() === SpanPosition.END) {
				preventDefault = true;
				appendNewArg();
			}
		}
		return preventDefault;
	}

	function onKeyDownBackspace(event: KeyboardEvent) {
		historyIndex = -1;
		const span = userSpans[workingChildIndex - 1];

		const position = span.position();
		if (position === SpanPosition.NONE) {
			return;
		}

		if (position <= SpanPosition.USER_START) {
			if (workingChildIndex == CommandIndex.COMMAND) {
				event.preventDefault();
			} else if (workingChildIndex >= CommandIndex.ARGS) {
				event.preventDefault();
				if (span.empty()) {
					removeWorkingArg();
				} else {
					joinCurrentChildWithPreviousChild();
				}
			}
		}
	}

	function onKeyDownArrowLeft(event: KeyboardEvent) {
		// ARROWLEFT - Potentially navigate to a previous arg.
		const span = userSpans[workingChildIndex - 1];

		if (span.position() <= SpanPosition.USER_START) {
			event.preventDefault();
			if (workingChildIndex >= CommandIndex.ARGS) {
				decrementWorkingArg();
			}
		}
	}

	function onKeyDownArrowRight(event: KeyboardEvent) {
		// ARROWLEFT - Potentially navigate to a previous arg.
		const span = userSpans[workingChildIndex - 1];
		if (
			span.position() == SpanPosition.END &&
			workingChildIndex < workingCommandLineDiv.children.length - 1
		) {
			event.preventDefault();
			incrementWorkingArg();
		}
	}

	function onKeyDownTab(event: KeyboardEvent) {
		event.preventDefault();

		const span = userSpans[workingChildIndex - 1];
		if (!span) {
			return;
		}

		const currentInput = span.text();

		//If no input is cached (first time hitting TAB)
		if (cachedInput === undefined) {
			cachedInput = currentInput;
		}
		const autoComplete = autoCompleter.getNextOption(cachedInput);

		if (autoComplete) {
			if (config.quoteMultiWordAutoCompletes && autoComplete.split(' ').length > 1) {
				span.replaceText(`'${autoComplete}''`);
			} else {
				span.replaceText(autoComplete);
			}
		}
	}

	function onKeyDownPreProcessing(event: KeyboardEvent) {
		if (event.code != 'Tab') {
			cachedInput = undefined;
		}
	}

	function onKeyDownPostProcessing(event: KeyboardEvent) {
		if (event.code != 'Tab') {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					const command = getAllCurrentInput();
					dispatch('get-current-command', command);
				});
			});
		}
	}

	/// Event Handling! ///
	function onKeyDown(event: KeyboardEvent) {
		onKeyDownPreProcessing(event);

		if (event.code === 'Enter') {
			onKeyDownEnter(event);
		} else if (event.code === 'Space') {
			// SPACE - Create new arguments. This may involve splitting existing commands/args.
			onKeyDownSpace(event);
		} else if (event.code === 'Backspace') {
			// BACKSPACE - Potentially remove the current arg and navigate to a previous arg.
			onKeyDownBackspace(event);
		} else if (event.code === 'ArrowLeft') {
			// ARROWLEFT - Potentially navigate to a previous arg.
			onKeyDownArrowLeft(event);
		} else if (event.code === 'ArrowRight') {
			// ARROWRIGHT- Potentially navigate to a later arg.
			onKeyDownArrowRight(event);
		} else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
			//ARROWUP/ARROWDOWN - Reserved for future feature to navigate command history.
			event.preventDefault();
			//TODO - navigate history.

			//replace the current command line with next item in history!
			if (!reader.isReading && config.history.enabled) {
				navigateHistory(event.code === 'ArrowDown');
			}
		} else if (event.code === 'Tab') {
			//TAB - Reserved for future feature to autocomplete text.
			//TODO - autocomplete.
			onKeyDownTab(event);
		} else {
			//ELSE - For now simply format args.
			setTimeout(() => {
				formatArgs();
			}, 25);
		}

		onKeyDownPostProcessing(event);
	}

	function onPaste(event: ClipboardEvent) {
		historyIndex = -1;
		event.preventDefault();
		if (event.clipboardData) {
			const textToPaste = event.clipboardData.getData('text');
			if (textToPaste.length > 0) {
				insertText(textToPaste);
			}
		}
	}

	function onClick() {
		if (!utils.selectionHasNonZeroRange()) {
			placeCursorAtWorkingIndex();
		}
	}

	function getCurrentCommand(): string {
		const lastChild = sverminalDiv.lastElementChild as HTMLElement;
		return (
			lastChild?.innerText.replace(promptText, '').replace(ZERO_WIDTH_SPACE_REGEX, '').trim() || ''
		);
	}

	function getAllCurrentInput(): string {
		const lastChild = sverminalDiv.lastElementChild as HTMLElement;
		return (
			lastChild?.innerText
				.replace(promptText, '')
				.replace(ZERO_WIDTH_SPACE_REGEX, '')
				.trimStart() || ''
		);
	}

	function getCurrentReaderInput(): string {
		const readerSpan = workingReaderSpan.element() as HTMLElement;
		return (
			readerSpan.innerText.replace(promptText, '').replace(ZERO_WIDTH_SPACE_REGEX, '').trim() || ''
		);
	}

	onMount(() => {
		commandHistory = createCommandHistory();

		appendNewCommandLine();

		reader.subscribe((value: string) => {
			if (value != undefined && value != '') {
				workingCommandLineDiv = document.createElement('div');
				workingCommandLineDiv.setAttribute('contenteditable', 'true');
				workingCommandLineDiv.classList.add('focus:outline-none');
				workingCommandLineDiv.onclick = (event) => {
					event.stopPropagation();
					if (!utils.selectionHasNonZeroRange()) {
						placeCursorAtWorkingIndex();
					}
				};
				sverminalDiv.appendChild(workingCommandLineDiv);

				let promptLine = document.createElement('span');
				promptLine.setAttribute('contenteditable', 'false');
				promptLine.innerHTML = `${value}`;
				workingCommandLineDiv.appendChild(promptLine);

				workingReaderSpan = new SverminalUserSpan([]);
				workingCommandLineDiv.appendChild(workingReaderSpan.element());
				workingReaderSpan.placeCursorAtEnd();
				sverminalDiv.scrollTop = sverminalDiv.scrollHeight;
			}
		});

		writer.subscribe((value: SverminalResponse) => {
			if (value != undefined) {
				const target = value.target ?? SverminalResponseTarget.TERMINAL;
				const htmlTarget = target === SverminalResponseTarget.SPLIT ? sverminalUiDiv : sverminalDiv;

				switch (value.type) {
					case SverminalResponseType.ECHO:
						{
							appendEcho(value.message, htmlTarget);
						}
						break;
					case SverminalResponseType.WARNING:
						{
							appendWarn(value.message, htmlTarget);
						}
						break;
					case SverminalResponseType.ERROR:
						{
							appendError(value.message, htmlTarget);
						}
						break;
					case SverminalResponseType.INFO:
						{
							appendInfo(value.message, htmlTarget);
						}
						break;
					case SverminalResponseType.FREEFORM:
						{
							appendFreeform(value.message, value.styles ?? [], htmlTarget);
						}
						break;
					case SverminalResponseType.FREEFORM_LINK:
						{
							appendFreeformAnchor(
								value.message,
								value.extra ?? '',
								value.styles ?? [],
								htmlTarget
							);
						}
						break;
					case SverminalResponseType.CLEAR:
						{
							htmlTarget.textContent = '';
						}
						break;
				}
			}
		});
	});
</script>

<VerticalSplitLayout splitActive={enableUI}>
	<div
		bind:this={sverminalUiDiv}
		slot="top"
		contenteditable="false"
		spellcheck="false"
		class="w-full h-full text-left p-2 font-mono text-sm md:text-base bg-slate-900 text-slate-100 resize-none overflow-auto"
		aria-multiline="true"
		role="textbox"
	></div>
	<div
		bind:this={sverminalDiv}
		slot="bottom"
		contenteditable="true"
		spellcheck="false"
		class="sverminal-main w-full h-full resize-none bg-slate-900 text-slate-100 font-mono rounded-md p-2 overflow-auto text-sm md:text-base text-left"
		role="textbox"
		aria-multiline="true"
		tabindex="0"
		on:keydown={onKeyDown}
		on:click={onClick}
		on:paste={onPaste}
	></div>
</VerticalSplitLayout>

<style>
	[contenteditable] {
		white-space: pre-wrap;
		outline: none;
	}
</style>
