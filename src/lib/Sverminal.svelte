<script context="module" lang="ts">
	export enum CommandIndex {
		PROMPT = 0,
		COMMAND,
		ARGS
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	import { defaultConfig, type Config } from '$lib/config/defaultConfig.js';
	import { createCommandHistory } from '$lib/history/factory.js';
	import {
		SverminalResponseType,
		type SverminalResponse,
		type SverminalWriter
	} from './writer/writer.js';
	import Page from '../routes/+page.svelte';
	import { SverminalUserSpan, SverminalPromptSpan, SpanPosition } from './core/span.js';

	export let processor: (command: string) => Promise<void>;
	export let promptPrefix = 'sverminal';
	export let config: Config = defaultConfig;
	export let writer: SverminalWriter;

	$: promptText = `${promptPrefix}${config.promptSuffix}`;

    const ZERO_WIDTH_SPACE: string = '\u200B';
    const ZERO_WIDTH_SPACE_REGEX: RegExp = /\u200B/g;
    const BASE_SPAN_LENGTH: number = ZERO_WIDTH_SPACE.length;

	let sverminalDiv: HTMLDivElement;
	let workingCommandLineDiv: HTMLDivElement;
	let workingChildIndex: number = CommandIndex.COMMAND;
	let historyIndex = -1;
    let userSpans: SverminalUserSpan[] = [];

	let commandHistory = createCommandHistory();

	writer.subscribe((value: SverminalResponse) => {
		if (value != undefined) {
			switch (value.type) {
				case SverminalResponseType.ECHO:
					{
						svecho(value.message);
					}
					break;
				case SverminalResponseType.WARNING:
					{
						svwarn(value.message);
					}
					break;
				case SverminalResponseType.ERROR:
					{
						sverror(value.message);
					}
					break;
				case SverminalResponseType.INFO:
					{
						svinfo(value.message);
					}
					break;
			}
		}
	});

	async function handleCommand(command: string) {
		try {
			lockCommand();
			await processor(command);
		} catch (error) {
			sverror(`Failed to process command: ${command} - Error: ${error}`);
		} finally {
			if (config.newlineBetweenCommands) {
				appendEmptyLine();
			}
			appendNewCommandLine();

			//Regardless of the result, save the command in history.
			commandHistory.push(command);
		}
	}

	function appendEmptyLine() {
		let emptyLine = document.createElement('div');
		emptyLine.setAttribute('contenteditable', 'false');
		emptyLine.classList.add(...config.style.text);
		emptyLine.innerHTML = ` `;
		sverminalDiv.appendChild(emptyLine);
	}

	function svecho(message: string) {
		let line = document.createElement('div');
		line.innerHTML = `${message}`;
		line.setAttribute('contenteditable', 'false');
		line.classList.add(...config.style.text);
		sverminalDiv.appendChild(line);
	}

	function svwarn(message: string) {
		let line = document.createElement('div');
		line.innerHTML = `${message}`;
		line.setAttribute('contenteditable', 'false');
		line.classList.add(...config.style.warn);
		sverminalDiv.appendChild(line);
	}

	function sverror(message: string) {
		let line = document.createElement('div');
		line.innerHTML = `${message}`;
		line.setAttribute('contenteditable', 'false');
		line.classList.add(...config.style.error);
		sverminalDiv.appendChild(line);
	}

	function svinfo(message: string) {
		let line = document.createElement('div');
		line.innerHTML = `${message}`;
		line.setAttribute('contenteditable', 'false');
		line.classList.add(...config.style.info);
		sverminalDiv.appendChild(line);
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

	function placeCursorAtEndOfTextNode(textnode: Text) {
		const range = document.createRange();
		const selection = window.getSelection();
		range.setStart(textnode, textnode.length);
		range.collapse(true);
		selection?.removeAllRanges();
		selection?.addRange(range);
	}

	function placeCursorAtStartOfTextNode(textnode: Text) {
		const range = document.createRange();
		const selection = window.getSelection();
		range.setStart(textnode, 0);
		range.collapse(true);
		selection?.removeAllRanges();
		selection?.addRange(range);
	}

	function placeCursorInTextNode(textnode: Text, offset: number) {
		const range = document.createRange();
		const selection = window.getSelection();
		range.setStart(textnode, offset);
		range.collapse(true);
		selection?.removeAllRanges();
		selection?.addRange(range);
	}

	function getWorkingTextNodeOrCreateIfNull(): Text {
		const childspan = workingCommandLineDiv.children.item(workingChildIndex) as Element;
		let textnode = childspan.firstChild as Text | null;
		if (!textnode) {
			let emptyTextnode: Text = new Text('');
			childspan.appendChild(emptyTextnode);
			textnode = emptyTextnode;
		}
		return textnode;
	}

    function getWorkingTextNodeTextContext(): string {
		const childspan = workingCommandLineDiv.children.item(workingChildIndex) as Element;
		let textnode = childspan.firstChild as Text | null;
		if (!textnode || !textnode.textContent) {
            console.error('sverminal error: working text node or text context null.');
			return '';
		}
		return textnode.textContent;
	}

	function placeCursorAtWorkingIndex(start: boolean = false) {
		if (workingChildIndex >= workingCommandLineDiv.children.length) {
			console.error('Failed to place cursor in Sverminal!');
			return;
		}

        let span = userSpans[workingChildIndex - 1];
        span.placeCursorAtEnd();
	}

	function appendNewCommandLine() {
		workingCommandLineDiv = document.createElement('div');
		workingCommandLineDiv.setAttribute('contenteditable', 'true');
		workingCommandLineDiv.classList.add('focus:outline-none');
		workingCommandLineDiv.onclick = (event) => {
			event.stopPropagation();
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
        userSpans.push(argSpan);

		workingChildIndex++;
		if (workingChildIndex >= workingCommandLineDiv.children.length) {
			workingCommandLineDiv.appendChild(argSpan.element());
			placeCursorAtWorkingIndex();
			console.log('new arg last!');
		} else {
			workingCommandLineDiv.insertBefore(
				argSpan.element(),
				workingCommandLineDiv.children[workingChildIndex]
			);
			placeCursorAtWorkingIndex(true);
			console.log('new arg before!');
		}
	}

	function removeWorkingArg() { 
        if(workingChildIndex < CommandIndex.ARGS){
            console.warn('sverminal tried to remove the command span.')
            return;
        }

		const span = userSpans[workingChildIndex - 1];
        userSpans.splice(workingChildIndex - 1, 1);

		workingCommandLineDiv.removeChild(span.element());
		workingChildIndex--;

		placeCursorAtWorkingIndex();

		console.log('rem arg');
	}

	function decrementWorkingArg() {
		workingChildIndex--;
		placeCursorAtWorkingIndex();
		console.log('dec arg');
	}

	function incrementWorkingArg() {
		workingChildIndex++;
		placeCursorAtWorkingIndex(true);
		console.log('inc arg');
	}

	function splitCurrentChild(offset: number) {
		let textContent = getWorkingTextNodeTextContext();
		const currentNodeReplacementText = textContent.substring(0, offset);
		const newArgText = textContent.substring(offset);
        textContent = currentNodeReplacementText;
		appendNewArg(newArgText);
	}

	function joinCurrentChildWithPreviousChild() {
		let workingTextNode = getWorkingTextNodeOrCreateIfNull();
		const textToJoin = workingTextNode.textContent;

		removeWorkingArg();

		workingTextNode = getWorkingTextNodeOrCreateIfNull();
		workingTextNode.textContent! += textToJoin?.trim();

		let offset = (workingTextNode.textContent?.length ?? 0) - (textToJoin?.trim().length ?? 0);
		placeCursorInTextNode(workingTextNode, offset);
	}

	function insertSimulatedSpace() {
		const workingTextNode = getWorkingTextNodeOrCreateIfNull();
		workingTextNode.textContent = ` ${workingTextNode.textContent}`;
	}

	function insertText(text: string) {
		const selection = window.getSelection();
		const range = selection?.getRangeAt(0);
		if (!range) {
			return;
		}

		const cachedWorkingIndex = workingChildIndex;
		const workingTextNode = getWorkingTextNodeOrCreateIfNull();
		const workingTextLength = workingTextNode.textContent?.length ?? 0;
		const isSplit = range.startOffset < workingTextLength;

		const textparts = text.split(' ');

		if (isSplit) {
			splitCurrentChild(range.startOffset);
			insertSimulatedSpace();
			workingChildIndex = cachedWorkingIndex;
		}

		textparts.forEach((part: string, index, arr) => {
			if (index == 0) {
				const workingTextNode = getWorkingTextNodeOrCreateIfNull();
				workingTextNode.textContent += part;
			} else if (index < arr.length - 1 || !isSplit) {
				appendNewArg(part);
				insertSimulatedSpace();
			} else {
				//Prepend to the next arg... This behavior depends on if we split the current text or not.
				workingChildIndex++;
				const workingTextNodeToAppend = getWorkingTextNodeOrCreateIfNull();
				workingTextNodeToAppend.textContent = `${part}${workingTextNodeToAppend.textContent?.trim()}`;
				insertSimulatedSpace();
				placeCursorInTextNode(workingTextNodeToAppend, part.length + 1);
			}
		});

		if (!isSplit) {
			placeCursorAtWorkingIndex();
		}
	}

	function lockCommand() {
		Array.from(workingCommandLineDiv.children).forEach((childspan: Element, index: number) => {
			if (index >= CommandIndex.COMMAND) {
				childspan.setAttribute('contenteditable', 'false');
			}
		});
	}

	function formatArgs() {
		Array.from(workingCommandLineDiv.children).forEach((childspan: Element, index: number) => {
			if (index >= CommandIndex.ARGS) {
				if (childspan.innerHTML.replace(ZERO_WIDTH_SPACE_REGEX,'').trim().startsWith('-')) {
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

		let parts = historicalCommand.split(' ').filter((part) => part != ' ');
		let command = parts.at(0);
		let args = parts.slice(1);

		//Clear the command! This should probably be its own function.
		for (; workingChildIndex > 0; --workingChildIndex) {
			let childToRemove = workingCommandLineDiv.children.item(workingChildIndex);
			if (childToRemove) {
				workingCommandLineDiv.removeChild(childToRemove);
			}
		}
		workingChildIndex = CommandIndex.COMMAND;
		appendCommand(command);
		args.forEach((arg) => {
			appendNewArg(arg);
			insertSimulatedSpace();
		});
		formatArgs();
		workingChildIndex = parts.length;
		placeCursorAtWorkingIndex();
	}

    /**
     * SPACE - Create new arguments. This may involve splitting existing commands/args.
     */
    function onKeyDownSpace(event: KeyboardEvent){
        historyIndex = -1;
        const span = userSpans[workingChildIndex - 1];

        if(span.populated())
        {
            event.preventDefault();
            if (span.position() === SpanPosition.MIDDLE) {
                splitCurrentChild(0); //TODO
                console.log('space split!');
            } else {
                appendNewArg();
                console.log('space new!');
            }
        } else {
            console.log('space nominal!');
        }
    }

    function onKeyDownBackspace(event: KeyboardEvent){
        historyIndex = -1;
        const span = userSpans[workingChildIndex - 1];

        const position = span.position();
        if(position === SpanPosition.NONE){
            return;
        }

        if(position <= SpanPosition.USER_START){
            if(workingChildIndex == CommandIndex.COMMAND){
                event.preventDefault();
            }else if(workingChildIndex >= CommandIndex.ARGS){
                event.preventDefault();
                if (span.empty()) {
                    removeWorkingArg();
                } else {
                    joinCurrentChildWithPreviousChild();
                }
            }
        }
    }

    function onKeyDownArrowLeft(event: KeyboardEvent){
        // ARROWLEFT - Potentially navigate to a previous arg.
        const span = userSpans[workingChildIndex - 1];
        
        if(span.position() <= SpanPosition.USER_START){
            event.preventDefault();
            if (workingChildIndex >= CommandIndex.ARGS) {
                decrementWorkingArg();
            } 
        }
    }

	/// Event Handling! ///
	function onKeyDown(event: KeyboardEvent) {
		const selection = window.getSelection();
		const range = selection?.getRangeAt(0);

		if (event.code === 'Enter') {
			historyIndex = -1;
			// ENTER - Command Handling
			event.preventDefault(); // Prevent default new line behavior
			const command = getCurrentCommand();
			if (command) {
				handleCommand(command);
			} else {
				appendNewCommandLine();
			}
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
			if (range) {
				let workingTextNode = getWorkingTextNodeOrCreateIfNull();
				const cursorOffset = range.startOffset;
				const spanTextLength = workingTextNode.textContent?.length ?? 0;
				if (
					cursorOffset >= spanTextLength &&
					workingChildIndex < workingCommandLineDiv.children.length - 1
				) {
					incrementWorkingArg();
				}
			}
		} else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
			//ARROWUP/ARROWDOWN - Reserved for future feature to navigate command history.
			event.preventDefault();
			//TODO - navigate history.

			//replace the current command line with next item in history!
			if (config.history.enabled) {
				navigateHistory(event.code === 'ArrowDown');
			}
		} else if (event.code === 'Tab') {
			//TAB - Reserved for future feature to autocomplete text.
			//TODO - autocomplete.
		} else {
			//ELSE - For now simply format args.
			setTimeout(() => {
				formatArgs();
			}, 25);
		}
	}

	function onPaste(event: ClipboardEvent) {
		historyIndex = -1;
		event.preventDefault();
		if (event.clipboardData) {
			const textToPaste = event.clipboardData.getData('text');
			if (textToPaste.length > 0) {
				console.log(textToPaste);
				insertText(textToPaste);
			}
		}
	}

	function onClick() {
		//Prevent automatic cursor movement if the user has a selection.
		const selection = window.getSelection();
		if (selection) {
			return;
		}
		placeCursorAtWorkingIndex();
	}

	function getCurrentCommand(): string {
		const lastChild = sverminalDiv.lastElementChild as HTMLElement;
		return lastChild?.innerText.replace(promptText, '').replace(ZERO_WIDTH_SPACE_REGEX,'').trim() || '';
	}

	onMount(() => {
		appendNewCommandLine();
	});
</script>

<div class="flex flex-col justify-center items-center">
	<div
		bind:this={sverminalDiv}
		contenteditable="true"
		spellcheck="false"
		class="w-full resize-none bg-slate-900 text-slate-100 font-mono rounded-md p-2 h-80 overflow-auto"
		role="textbox"
		aria-multiline="true"
		tabindex="0"
		on:keydown={onKeyDown}
		on:click={onClick}
		on:paste={onPaste}
	></div>
</div>

<style>
	[contenteditable] {
		white-space: pre-wrap;
		outline: none;
	}
</style>
