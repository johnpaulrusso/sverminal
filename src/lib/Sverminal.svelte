<script context="module" lang="ts">
	export enum CommandIndex {
		PREFIX = 0,
		COMMAND,
		ARGS
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	export let processCommand: (command: string) => Promise<string>;

	const prefix = 'sverm3.0$>';

	let sverminalDiv: HTMLDivElement;
	let workingCommandLineDiv: HTMLDivElement;
	let workingChildIndex: number = CommandIndex.COMMAND;

	async function handleCommand(command: string) {
		try {
			await processCommand(command);
		} catch (error) {
			console.error('Command processing failed', error);
		} finally {
			appendNewCommandLine();
		}
	}

	function appendPrompt() {
		let promptSpan = document.createElement('span');
		promptSpan.setAttribute('contenteditable', 'false');
		promptSpan.classList.add('text-cyan-500', 'focus:outline-none');
		promptSpan.innerHTML = `${prefix} `;
		workingCommandLineDiv.appendChild(promptSpan);
	}

	function appendEmptyCommand() {
		let commandSpan = document.createElement('span');
		commandSpan.setAttribute('contenteditable', 'true');
		commandSpan.classList.add('text-yellow-500', 'focus:outline-none');

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

		appendPrompt();
		appendEmptyCommand();

		sverminalDiv.appendChild(workingCommandLineDiv);

		workingChildIndex = CommandIndex.COMMAND;
		placeCursorAtWorkingIndex();
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

	function formatArgs() {
		Array.from(workingCommandLineDiv.children).forEach((childspan: Element, index: number) => {
			if (index >= CommandIndex.ARGS) {
				if (childspan.innerHTML.trim().startsWith('-')) {
					childspan.classList.add('text-slate-400');
				} else {
					childspan.classList.remove('text-slate-400');
				}
			}
		});
	}

	/// Event Handling! ///
	function onKeyDown(event: KeyboardEvent) {
		const selection = window.getSelection();
		const range = selection?.getRangeAt(0);

		if (event.code === 'Enter') {
			event.preventDefault(); // Prevent default new line behavior
			const command = getCurrentCommand();
			if (command) {
				handleCommand(command);
			} else {
				appendNewCommandLine();
			}
		} else if (event.code === 'Space') {
			if (range) {
				let workingTextNode = getWorkingTextNodeOrCreateIfNull();
				const cursorOffset = range.startOffset;
				const spanTextLength = workingTextNode.textContent?.length!;
				if (workingTextNode.textContent?.trim().length! > 0) {
					if (cursorOffset < spanTextLength) {
						console.log('split!');
						splitCurrentChild(cursorOffset);
					} else {
						appendNewArg();
					}
				}
			}
		} else if (event.code === 'Backspace') {
			if (range) {
				if (workingChildIndex >= CommandIndex.ARGS && range.startOffset <= 1) {
					event.preventDefault();
					removeWorkingArg();
				}
			}
		} else if (event.code === 'ArrowLeft') {
			if (range) {
				if (workingChildIndex >= CommandIndex.ARGS && range.startOffset <= 1) {
					event.preventDefault();
					decrementWorkingArg();
				}
			}
		} else if (event.code === 'ArrowRight') {
			if (range) {
				let workingTextNode = getWorkingTextNodeOrCreateIfNull();
				const cursorOffset = range.startOffset;
				const spanTextLength = workingTextNode.textContent?.length!;
				if (workingTextNode.textContent?.trim().length! > 0) {
					if (cursorOffset >= spanTextLength) {
						incrementWorkingArg();
					}
				}
			}
		} else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
			event.preventDefault(); //TODO
		} else {
			setTimeout(() => {
				formatArgs();
			}, 25);
		}
	}

	function getCurrentCommand(): string {
		const lastChild = sverminalDiv.lastElementChild as HTMLElement;
		return lastChild?.innerText.replace(prefix, '').trim() || '';
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
		class="w-full resize-none bg-slate-900 text-slate-100 font-mono rounded-md p-2 h-40 overflow-auto"
		role="textbox"
		aria-multiline="true"
		tabindex="0"
		on:keydown={onKeyDown}
		on:click={() => {
			placeCursorAtWorkingIndex();
		}}
	></div>
</div>

<style>
	[contenteditable] {
		white-space: pre-wrap;
		outline: none;
	}
</style>
