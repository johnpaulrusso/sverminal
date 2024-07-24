<script context="module" lang="ts">
	export enum CommandIndex {
		PROMPT = 0,
		COMMAND,
		ARGS
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { responseStream, SverminalResponseType, type SverminalResponse } from './Stores.js';

    import { defaultConfig, type Config } from '$lib/config/defaultConfig.js'

	export let processCommand: (command: string) => Promise<void>;
    export let promptPrefix = "sverminal"; 
    export let config: Config = defaultConfig;

    $: promptText = `${promptPrefix}${config.promptSuffix} `

	let sverminalDiv: HTMLDivElement;
	let workingCommandLineDiv: HTMLDivElement;
	let workingChildIndex: number = CommandIndex.COMMAND;

	responseStream.subscribe((value: SverminalResponse) => {
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
			await processCommand(command);
		} catch (error) {
			sverror(`Failed to process command: ${command}`);
		} finally {
			appendEmptyLine();
			appendNewCommandLine();
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
		let promptSpan = document.createElement('span');
		promptSpan.setAttribute('contenteditable', 'false');
		promptSpan.classList.add(...config.style.prompt, 'focus:outline-none');
		promptSpan.innerHTML = promptText;
		workingCommandLineDiv.appendChild(promptSpan);
	}

	function appendEmptyCommand() {
		let commandSpan = document.createElement('span');
		commandSpan.setAttribute('contenteditable', 'true');
		commandSpan.classList.add(...config.style.command, 'focus:outline-none');

		let emptyTextnode: Text = new Text('');
		commandSpan.appendChild(emptyTextnode);

		workingCommandLineDiv.appendChild(commandSpan);
	}

	function placeCursorAtEndOfTextNode(textnode: Text) {
		const range = document.createRange();
		const selection = window.getSelection();
		range.setStart(textnode, textnode.textContent?.length!);
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

	function placeCursorAtWorkingIndex(start: boolean = false) {
		if (workingChildIndex >= workingCommandLineDiv.children.length) {
			console.error('Failed to place cursor in Sverminal!');
			return;
		}

		const textnode = getWorkingTextNodeOrCreateIfNull();

		if (start) {
			placeCursorAtStartOfTextNode(textnode);
		} else {
			placeCursorAtEndOfTextNode(textnode);
		}
	}

	function appendNewCommandLine() {
		workingCommandLineDiv = document.createElement('div');
		workingCommandLineDiv.setAttribute('contenteditable', 'true');
		workingCommandLineDiv.classList.add('focus:outline-none');
		workingCommandLineDiv.onclick = (event) => {
			event.stopPropagation();
		};

		appendPrompt();
		appendEmptyCommand();

		sverminalDiv.appendChild(workingCommandLineDiv);

		workingChildIndex = CommandIndex.COMMAND;
		placeCursorAtWorkingIndex();

		sverminalDiv.scrollTop = sverminalDiv.scrollHeight;
	}

	function appendNewArg(arg: string = '') {
		let argSpan = document.createElement('span');
		argSpan.setAttribute('contenteditable', 'true');
		argSpan.classList.add('focus:outline-none');
		argSpan.innerHTML = ``;

		let textnode: Text = new Text(arg);
		argSpan.appendChild(textnode);

		workingChildIndex++;
		if (workingChildIndex >= workingCommandLineDiv.children.length) {
			workingCommandLineDiv.appendChild(argSpan);
			placeCursorAtWorkingIndex(true);
			console.log('new arg last!');
		} else {
			workingCommandLineDiv.insertBefore(
				argSpan,
				workingCommandLineDiv.children[workingChildIndex]
			);
			placeCursorAtWorkingIndex(true);
			console.log('new arg before!');
		}
	}

	function removeWorkingArg() {
		let childToRemove = workingCommandLineDiv.children[workingChildIndex] as Element;

		if (childToRemove == null) {
			console.log(`index: ${workingChildIndex}, length" ${workingCommandLineDiv.children.length}`);
		}

		workingCommandLineDiv.removeChild(childToRemove);
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
		let currentTextNode = getWorkingTextNodeOrCreateIfNull();
		let currentNodeReplacementText = '';
		let newArgText = '';
		if (currentTextNode.textContent) {
			currentNodeReplacementText = currentTextNode.textContent?.substring(0, offset);
			newArgText = currentTextNode.textContent?.substring(offset);
			currentTextNode.textContent = currentNodeReplacementText;
		}
		appendNewArg(newArgText);
	}

	function joinCurrentChildWithPreviousChild() {
		let workingTextNode = getWorkingTextNodeOrCreateIfNull();
		const textToJoin = workingTextNode.textContent;

		removeWorkingArg();

		workingTextNode = getWorkingTextNodeOrCreateIfNull();
		workingTextNode.textContent! += textToJoin?.trim();

		placeCursorInTextNode(
			workingTextNode,
			workingTextNode.textContent!.length - textToJoin?.trim().length!
		);
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
		const workingTextLength = workingTextNode.textContent?.length!;
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

	function backspaceFirstCommandCharacter() {
		const commandNode = getWorkingTextNodeOrCreateIfNull();
		commandNode.textContent = '';
		placeCursorAtWorkingIndex();
	}

	function formatArgs() {
		Array.from(workingCommandLineDiv.children).forEach((childspan: Element, index: number) => {
			if (index >= CommandIndex.ARGS) {
				if (childspan.innerHTML.trim().startsWith('-')) {
					childspan.classList.add(...config.style.flags);
                    childspan.classList.remove(...config.style.text);
				} else {
                    childspan.classList.add(...config.style.text);
					childspan.classList.remove(...config.style.flags);
				}
			}
		});
	}

	/// Event Handling! ///
	function onKeyDown(event: KeyboardEvent) {
		const selection = window.getSelection();
		const range = selection?.getRangeAt(0);

		if (event.code === 'Enter') {
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
			if (range) {
				let workingTextNode = getWorkingTextNodeOrCreateIfNull();
				const cursorOffset = range.startOffset;
				const spanTextLength = workingTextNode.textContent?.length!;
				if (workingTextNode.textContent?.trim().length! > 0) {
					if (cursorOffset < spanTextLength) {
						splitCurrentChild(cursorOffset);
					} else {
						appendNewArg();
					}
				}
			}
		} else if (event.code === 'Backspace') {
			// BACKSPACE - Potentially remove the current arg and navigate to a previous arg.
			if (range) {
				let workingTextNode = getWorkingTextNodeOrCreateIfNull();
				const spanTextLength = workingTextNode.textContent?.length!;
				if (workingChildIndex >= CommandIndex.ARGS && range.startOffset <= 1) {
					event.preventDefault();
					if (spanTextLength <= 1) {
						removeWorkingArg();
					} else {
						joinCurrentChildWithPreviousChild();
					}
				} else if (workingChildIndex == CommandIndex.COMMAND && range.startOffset <= 1) {
					event.preventDefault();
					backspaceFirstCommandCharacter();
				}
			}
		} else if (event.code === 'ArrowLeft') {
			// ARROWLEFT - Potentially navigate to a previous arg.
			if (range) {
				if (workingChildIndex >= CommandIndex.ARGS && range.startOffset <= 1) {
					event.preventDefault();
					decrementWorkingArg();
				}
			}
		} else if (event.code === 'ArrowRight') {
			// ARROWRIGHT- Potentially navigate to a later arg.
			if (range) {
				let workingTextNode = getWorkingTextNodeOrCreateIfNull();
				const cursorOffset = range.startOffset;
				const spanTextLength = workingTextNode.textContent?.length!;
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
		event.preventDefault();
		if (event.clipboardData) {
			const textToPaste = event.clipboardData.getData('text');
			if (textToPaste.length > 0) {
				console.log(textToPaste);
				insertText(textToPaste);
			}
		}
	}

	function getCurrentCommand(): string {
		const lastChild = sverminalDiv.lastElementChild as HTMLElement;
		return lastChild?.innerText.replace(promptText, '').trim() || '';
	}

	onMount(() => {
		appendNewCommandLine();
	});
</script>

<div class="flex flex-col justify-center items-center">
	<div
		bind:this={sverminalDiv}
		contenteditable="false"
		spellcheck="false"
		class="w-full resize-none bg-slate-900 text-slate-100 font-mono rounded-md p-2 h-80 overflow-auto"
		role="textbox"
		aria-multiline="true"
		tabindex="0"
		on:keydown={onKeyDown}
		on:click={() => {
			placeCursorAtWorkingIndex();
		}}
		on:paste={onPaste}
	></div>
</div>

<style>
	[contenteditable] {
		white-space: pre-wrap;
		outline: none;
	}
</style>
