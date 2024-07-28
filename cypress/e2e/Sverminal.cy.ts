
const STARTING_CURSOR_OFFSET = 2;

function verifySelectionAndRange(expectedOffset: number, expectedText: string) {
    //Verify the initial cursor location.
    cy.window().then(window => {
        const selection = window.getSelection();
        expect(selection.rangeCount).equals(1);

        const range = selection.getRangeAt(0);
        expect(range.commonAncestorContainer.textContent).equals(expectedText);
        expect(range.startOffset).equals(expectedOffset);
    })
}

function verifyLineContent(line: JQuery<HTMLElement>, expectedText: string[]) {
    expect(line.children().length).equals(expectedText.length);
    line.children().toArray().forEach((child, index) => {
        expect(child.tagName).equals('SPAN')
        expect(child.innerHTML).equals(expectedText[index]);
    })
}

function getActiveLine(): Cypress.Chainable<JQuery<HTMLElement>>{
    return cy.get('.sverminal-main').children().last();
}

function moveCursorInCurrentElement(offset: number){
    getActiveLine().then(commandLine => {
        let argument = commandLine.children().last();
        setCursor(argument, offset);
    }) 
}

function moveCursorToStartOfCurrentElement(){
    moveCursorInCurrentElement(STARTING_CURSOR_OFFSET);
}

function setCursor(element: JQuery<HTMLElement>, offset: number) {
    cy.window().then(window => {
        const selection = window.getSelection();    
        const range = window.document.createRange();
        range.setStart(element.get(0).firstChild, offset);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
    })
}

function sverminalType(text: string) {
    cy.get('.sverminal-main')
                .should('be.visible')
                .wait(50)
                .type(text, { delay: 10 });
}

beforeEach(() => {
    cy.visit('http://localhost:5173/');
})

describe('sverminal initial cursor position user actions', () => {
  it('sverminal initialization', () => {
    const element = cy.get('.sverminal-main');

    element.should('not.be.null');

    //Verify the initial command line spans.
    element.children().should('have.length', 1);

    getActiveLine().then(commandLine => {
        verifyLineContent(commandLine, ['sverminal&gt;', ' \u200B']);
    })

    //Verify the initial cursor location.
    verifySelectionAndRange(2, ' \u200B');

  })

  it('space key from the initial cursor position adds whitespace to the command.', () => {
    sverminalType(' ')
    verifySelectionAndRange(3, ' \u200B ');
  })

  it('left arrow key from the initial cursor position should do nothing.', () => {
    sverminalType('{leftArrow}')
    verifySelectionAndRange(2, ' \u200B');
  })

  it('right arrow key from the initial cursor position should do nothing.', () => {
    sverminalType('{rightArrow}')
    verifySelectionAndRange(2, ' \u200B');
  })

  it('backspace from the initial cursor position should do nothing.', () => {
    sverminalType('{backspace}')
    verifySelectionAndRange(2, ' \u200B');
  })

  it('up arrow from the initial cursor position should do nothing if no history is present.', () => {
    sverminalType('{upArrow}')
    verifySelectionAndRange(2, ' \u200B');
  })

  it('down arrow from the initial cursor position should do nothing if no history is present.', () => {
    sverminalType('{upArrow}')
    verifySelectionAndRange(2, ' \u200B');
  })

  it('enter from the initial cursor position should create a new line.', () => {
    sverminalType('{enter}');
    cy.get('.sverminal-main').children().should('have.length', 2);
    verifySelectionAndRange(2, ' \u200B');
  })

})

describe('sverminal user action - SPACE', () => {

    it('space key from the initial cursor position adds whitespace to the command.', () => {
      sverminalType(' ')
      verifySelectionAndRange(3, ' \u200B ');
      getActiveLine().then(commandLine => {
        verifyLineContent(commandLine, ['sverminal&gt;', ' \u200B ']);
      })
    })

    it('space key after a command creates a new empty argument.', () => {
        sverminalType('command');
        sverminalType(' ');
        verifySelectionAndRange(2, ' \u200B');
        getActiveLine().then(commandLine => {
          verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200B']);
        })
    })

    it('space key after an argument creates a new empty argument.', () => {
        sverminalType('command');
        sverminalType(' ');
        sverminalType('arg1');
        sverminalType(' ');
        verifySelectionAndRange(2, ' \u200B');
        getActiveLine().then(commandLine => {
          verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200Barg1', ' \u200B']);
        })
    
    }) 

    it('space key at the beginning of an existing command pads whitespace to the beginning of the command.', () => {
        sverminalType('command');
        getActiveLine().then(commandLine => {
            let command = commandLine.children().last();
            setCursor(command, 2);
        }) 
        sverminalType(' ');
        verifySelectionAndRange(3, ' \u200B command');
        getActiveLine().then(commandLine => {
          verifyLineContent(commandLine, ['sverminal&gt;', ' \u200B command']);
        })
    
    })

    it('space key in the middle of an existing command splits the text after the cursor into a new argument.', () => {
        sverminalType('command');
        getActiveLine().then(commandLine => {
            let command = commandLine.children().last();
            setCursor(command, 5);
        }) 
        sverminalType(' ');
        verifySelectionAndRange(2, ' \u200Bmand');
        getActiveLine().then(commandLine => {
          verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcom', ' \u200Bmand']);
        })

    })
  })


  describe('sverminal user action - BACKSPACE', () => {

    it('backspace from the initial cursor position should do nothing.', () => {
        sverminalType('{backspace}');
        verifySelectionAndRange(2, ' \u200B');
    })
    
    it('backspace through leading whitespace removes leading whitespace.', () => {
        sverminalType(' ');
        sverminalType('{backspace}');
        verifySelectionAndRange(2, ' \u200B');
    })

    it('backspace through single character command removes command.', () => {
        sverminalType('c');
        sverminalType('{backspace}');
        verifySelectionAndRange(2, ' \u200B');
    })

    it('backspaces through multi character command removes command.', () => {
        sverminalType('com');
        sverminalType('{backspace}');
        sverminalType('{backspace}');
        sverminalType('{backspace}');
        verifySelectionAndRange(2, ' \u200B');
    })

    it('backspace from empty argument removes argument.', () => {
        sverminalType('command');
        sverminalType(' ');
        sverminalType('a');
        sverminalType('{backspace}');
        sverminalType('{backspace}');
        verifySelectionAndRange(9, ' \u200Bcommand');
        getActiveLine().then(commandLine => {
            verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand']);
        })
    })

    it('backspace in leading whitespace of populated argument does not remove argument.', () => {
        sverminalType('command');
        sverminalType(' ');
        sverminalType('a');
        moveCursorToStartOfCurrentElement();
        sverminalType(' '); //add leading whitespace
        sverminalType('{backspace}');
        verifySelectionAndRange(2, ' \u200Ba');
        getActiveLine().then(commandLine => {
            verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200Ba']);
        })
    })

    it('backspace in leading whitespace of empty argument does not remove argument.', () => {
        sverminalType('command');
        sverminalType(' ');
        sverminalType('a');
        moveCursorToStartOfCurrentElement();
        sverminalType(' '); //add leading whitespace
        moveCursorInCurrentElement(4);
        sverminalType('{backspace}'); //remove the 'a'
        sverminalType('{backspace}'); //remove the leading whitespace
        verifySelectionAndRange(2, ' \u200B');
        getActiveLine().then(commandLine => {
            verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200B']);
        })
    })
    
    it('backspace from populated argument joins argument to previous item.', () => {
        sverminalType('command arg');
        moveCursorToStartOfCurrentElement();
        sverminalType('{backspace}');
        verifySelectionAndRange(9, ' \u200Bcommandarg');
        getActiveLine().then(commandLine => {
            verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommandarg']);
        })
    })
  })