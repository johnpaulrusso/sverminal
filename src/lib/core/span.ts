
const ZERO_WIDTH_SPACE: string = '\u200B';

export enum SpanPosition {
    NONE = 0,
    TRUE_START,
    USER_START,
    MIDDLE,
    END
}

export abstract class SverminalSpan {

    readonly span: Element;

    constructor(classes: string[]){
        this.span = document.createElement('span');
        this.span.classList.add(...classes, 'focus:outline-none');
    }

    element() : Element {
        return this.span;
    }

    lock() {
        this.span.setAttribute('contenteditable', 'false');
    }

    unlock() {
        this.span.setAttribute('contenteditable', 'true');
    }
}

export class SverminalPromptSpan extends SverminalSpan{

    constructor(prompt: string, classes: string[]){
        super(classes);
        
		this.span.innerHTML = prompt;
        this.lock();
    }

}

//All spans entered by the user.
export class SverminalUserSpan extends SverminalSpan{

    readonly textnode: Text;
    static readonly BASE_LENGTH = ` ${ZERO_WIDTH_SPACE}`.length

    constructor(classes: string[], value: string = ''){
        super(classes);
        
        //By default, all commands start with a space and then a zero width space.
        //The zero-width space helps with correct cursor placement between browsers.
        this.textnode = new Text(` ${ZERO_WIDTH_SPACE}${value}`);
		this.span.appendChild(this.textnode);
        this.unlock();
    }

    length(): number {
        return this.textnode.length;
    }

    /**
     * empty
     * @returns true if the nothing has been entered into the span by the user.
     */
    empty(): boolean {
        if(this.textnode.textContent === null){
            throw new Error('This should never occur!')
        }
        return this.textnode.textContent.length == SverminalUserSpan.BASE_LENGTH;
    }  

    /**
     * populated
     * @returns true if the user has entered any non-whitespace text into the span.
     */
    populated() : boolean {
        if(this.textnode.textContent === null){
            throw new Error('This should never occur!')
        }
        return this.textnode.textContent.trim().length > SverminalUserSpan.BASE_LENGTH;
    }

    /**
     * position
     * @param range Range of a selection.
     * @returns the relatve position of the cursor within the span.
     * Returns NONE if there is no selection/range in the window.
     * TODO: If there IS a range, make sure this span is the selected node!
     */
    position(): SpanPosition {
        const selection = window.getSelection();
        if(!selection){
            return SpanPosition.NONE;
        } 

        const range = selection.getRangeAt(0);
        if(!range){
            return SpanPosition.NONE;
        }

        if(range.startOffset == 0){
            return SpanPosition.TRUE_START;
        } else if(range.startOffset <= SverminalUserSpan.BASE_LENGTH){
            return SpanPosition.USER_START;
        } else if(range.startOffset == this.textnode.length){
            return SpanPosition.END;
        } else if (range.startOffset > this.textnode.length) {
            console.warn('sverminal range position is greater than the span length.');
            return SpanPosition.NONE;
        } else {
            return SpanPosition.MIDDLE;
        }
    }

    placeCursor(index: number) {
		const range = document.createRange();
		const selection = window.getSelection();
		range.setStart(this.textnode, index);
		range.collapse(true);
		selection?.removeAllRanges();
		selection?.addRange(range);
    }

    placeCursorAtTrueStart() {
        this.placeCursor(0);
    }

    placeCursorAtUserStart() {
        this.placeCursor(SverminalUserSpan.BASE_LENGTH);
    }

    placeCursorAtEnd() {
        this.placeCursor(this.textnode.length);
    }
}
