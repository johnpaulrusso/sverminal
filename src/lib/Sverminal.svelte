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
	import { SverminalUserSpan, SverminalPromptSpan, SpanPosition } from './core/span.js';

	export let processor: (command: string) => Promise<void>;
	export let promptPrefix = 'sverminal';
	export let config: Config = defaultConfig;
	export let writer: SverminalWriter;

	$: promptText = `${promptPrefix}${config.promptSuffix}`;

    const ZERO_WIDTH_SPACE_REGEX: RegExp = /\u200B/g;

	let sverminalDiv: HTMLDivElement;
	let workingCommandLineDiv: HTMLDivElement;
	let workingChildIndex: number = CommandIndex.COMMAND;
	let historyIndex = -1;
    let userSpans: SverminalUserSpan[] = [];
    let commandInProgress = false;

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
            commandInProgress = true;
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
            commandInProgress = false;
		}
	}

	function appendEmptyLine() {
		let emptyLine = document.createElement('div');
		emptyLine.setAttribute('contenteditable', 'false');
		emptyLine.classList.add(...config.style.text);
		emptyLine.innerHTML = ` `;
		sverminalDiv.appendChild(emptyLine);
        sverminalDiv.scrollTop = sverminalDiv.scrollHeight;
	}

	function svecho(message: string) {
		let line = document.createElement('div');
		line.innerHTML = `${message}`;
		line.setAttribute('contenteditable', 'false');
		line.classList.add(...config.style.text);
		sverminalDiv.appendChild(line);
        sverminalDiv.scrollTop = sverminalDiv.scrollHeight;
	}

	function svwarn(message: string) {
		let line = document.createElement('div');
		line.innerHTML = `${message}`;
		line.setAttribute('contenteditable', 'false');
		line.classList.add(...config.style.warn);
		sverminalDiv.appendChild(line);
        sverminalDiv.scrollTop = sverminalDiv.scrollHeight;
	}

	function sverror(message: string) {
		let line = document.createElement('div');
		line.innerHTML = `${message}`;
		line.setAttribute('contenteditable', 'false');
		line.classList.add(...config.style.error);
		sverminalDiv.appendChild(line);
        sverminalDiv.scrollTop = sverminalDiv.scrollHeight;
	}

	function svinfo(message: string) {
		let line = document.createElement('div');
		line.innerHTML = `${message}`;
		line.setAttribute('contenteditable', 'false');
		line.classList.add(...config.style.info);
		sverminalDiv.appendChild(line);
        sverminalDiv.scrollTop = sverminalDiv.scrollHeight;
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
        if(start){
            span.placeCursorAtUserStart();
        }else{
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
			console.log('new arg last!');
		} else {
            userSpans = [
                ...userSpans.slice(0, workingChildIndex - 1), 
                argSpan, 
                ...userSpans.slice(workingChildIndex - 1)
            ]
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
        if(!performSpace()){
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
		const selection = window.getSelection();
		const range = selection?.getRangeAt(0); 
		if (!range) { 
			return;
		}

        const textparts = splitStringWithSpacesAndTabs(text);
    
        textparts.forEach((part: string, index, arr) => { 
            const span = userSpans[workingChildIndex - 1];
            if(part === ' ' || part === '\u0009'){
                insertSimulatedSpace();
            }else{
                span.insertAtCursorPosition(part);
            }
        });

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
	}

    function onKeyDownEnter(event: KeyboardEvent){
        historyIndex = -1;
        // ENTER - Command Handling
        event.preventDefault(); // Prevent default new line behavior
        if(!commandInProgress){
            const command = getCurrentCommand();
            if (command) {
                handleCommand(command);
            } else {
                appendNewCommandLine();
            }
        }
    }

    /**
     * SPACE - Create new arguments. This may involve splitting existing commands/args.
     */
    function onKeyDownSpace(event: KeyboardEvent){
        historyIndex = -1;
        if(performSpace()){
            event.preventDefault();
        }
    }

    function performSpace(): boolean{
        const span = userSpans[workingChildIndex - 1];
        let preventDefault = false;
        if(span.populated())
        {   
            if (span.position() === SpanPosition.MIDDLE) {
                preventDefault = true;
                splitWorkingSpan(); //TODO
                placeCursorAtWorkingIndex(true);
                console.log('space split!');
            } else if (span.position() === SpanPosition.END) {
                preventDefault = true; 
                appendNewArg();
                console.log('space new!');
            } else {
                console.log('space nominal!');
            }
        } else {
            console.log('space nominal!');
        }
        return preventDefault;
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

    function onKeyDownArrowRight(event: KeyboardEvent){
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

	/// Event Handling! ///
	function onKeyDown(event: KeyboardEvent) {
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
		class="sverminal-main w-full resize-none bg-slate-900 text-slate-100 font-mono rounded-md p-2 h-80 overflow-auto"
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
