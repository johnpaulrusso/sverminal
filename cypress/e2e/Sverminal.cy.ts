
beforeEach(() => {
    cy.visit('http://localhost:5173/');
})

describe('sverminal initial cursor position user actions', () => {
  it('sverminal initialization', () => {
    const element = cy.get('.sverminal-main');

    element.should('not.be.null');

    //Verify the initial command line spans.
    element.children().should('have.length', 1);

    cy.getActiveLine().then(commandLine => {
        cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200B']);
    })

    //Verify the initial cursor location.
    cy.verifySelectionAndRange(2, ' \u200B');

  })

  it('space key from the initial cursor position adds whitespace to the command.', () => {
    cy.sverminalType(' ')
    cy.verifySelectionAndRange(3, ' \u200B ');
  })

  it('left arrow key from the initial cursor position should do nothing.', () => {
    cy.sverminalType('{leftArrow}')
    cy.verifySelectionAndRange(2, ' \u200B');
  })

  it('right arrow key from the initial cursor position should do nothing.', () => {
    cy.sverminalType('{rightArrow}')
    cy.verifySelectionAndRange(2, ' \u200B');
  })

  it('backspace from the initial cursor position should do nothing.', () => {
    cy.sverminalType('{backspace}')
    cy.verifySelectionAndRange(2, ' \u200B');
  })

  it('up arrow from the initial cursor position should do nothing if no history is present.', () => {
    cy.sverminalType('{upArrow}')
    cy.verifySelectionAndRange(2, ' \u200B');
  })

  it('down arrow from the initial cursor position should do nothing if no history is present.', () => {
    cy.sverminalType('{upArrow}')
    cy.verifySelectionAndRange(2, ' \u200B');
  })

  it('enter from the initial cursor position should create a new line.', () => {
    cy.sverminalType('{enter}');
    cy.get('.sverminal-main').children().should('have.length', 2);
    cy.verifySelectionAndRange(2, ' \u200B');
  })

})

describe('sverminal user action - SPACE', () => {

    it('space key from the initial cursor position adds whitespace to the command.', () => {
      cy.sverminalType(' ')
      cy.verifySelectionAndRange(3, ' \u200B ');
      cy.getActiveLine().then(commandLine => {
        cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200B ']);
      })
    })

    it('space key after a command creates a new empty argument.', () => {
        cy.sverminalType('command');
        cy.sverminalType(' ');
        cy.verifySelectionAndRange(2, ' \u200B');
        cy.getActiveLine().then(commandLine => {
          cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200B']);
        })
    })

    it('space key after an argument creates a new empty argument.', () => {
        cy.sverminalType('command');
        cy.sverminalType(' ');
        cy.sverminalType('arg1');
        cy.sverminalType(' ');
        cy.verifySelectionAndRange(2, ' \u200B');
        cy.getActiveLine().then(commandLine => {
          cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200Barg1', ' \u200B']);
        })
    
    }) 

    it('space key at the beginning of an existing command pads whitespace to the beginning of the command.', () => {
        cy.sverminalType('command');
        cy.moveCursorToStartOfCurrentElement();
        cy.sverminalType(' ');
        cy.verifySelectionAndRange(3, ' \u200B command');
        cy.getActiveLine().then(commandLine => {
          cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200B command']);
        })
    
    })

    it('space key in the middle of an existing command splits the text after the cursor into a new argument.', () => {
        cy.sverminalType('command');
        cy.moveCursorInCurrentElement(5);
        cy.sverminalType(' ');
        cy.verifySelectionAndRange(2, ' \u200Bmand');
        cy.getActiveLine().then(commandLine => {
          cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcom', ' \u200Bmand']);
        })

    })
  })


  describe('sverminal user action - BACKSPACE', () => {

    it('backspace from the initial cursor position should do nothing.', () => {
        cy.sverminalType('{backspace}');
        cy.verifySelectionAndRange(2, ' \u200B');
    })
    
    it('backspace through leading whitespace removes leading whitespace.', () => {
        cy.sverminalType(' ');
        cy.sverminalType('{backspace}');
        cy.verifySelectionAndRange(2, ' \u200B');
    })

    it('backspace through single character command removes command.', () => {
        cy.sverminalType('c');
        cy.sverminalType('{backspace}');
        cy.verifySelectionAndRange(2, ' \u200B');
    })

    it('backspaces through multi character command removes command.', () => {
        cy.sverminalType('com');
        cy.sverminalType('{backspace}');
        cy.sverminalType('{backspace}');
        cy.sverminalType('{backspace}');
        cy.verifySelectionAndRange(2, ' \u200B');
    })

    it('backspace from empty argument removes argument.', () => {
        cy.sverminalType('command');
        cy.sverminalType(' ');
        cy.sverminalType('a');
        cy.sverminalType('{backspace}');
        cy.sverminalType('{backspace}');
        cy.verifySelectionAndRange(9, ' \u200Bcommand');
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand']);
        })
    })

    it('backspace in leading whitespace of populated argument does not remove argument.', () => {
        cy.sverminalType('command');
        cy.sverminalType(' ');
        cy.sverminalType('a');
        cy.moveCursorToStartOfCurrentElement();
        cy.sverminalType(' '); //add leading whitespace
        cy.sverminalType('{backspace}');
        cy.verifySelectionAndRange(2, ' \u200Ba');
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200Ba']);
        })
    })

    it('backspace in leading whitespace of empty argument does not remove argument.', () => {
        cy.sverminalType('command');
        cy.sverminalType(' ');
        cy.sverminalType('a');
        cy.moveCursorToStartOfCurrentElement();
        cy.sverminalType(' '); //add leading whitespace
        cy.moveCursorInCurrentElement(4);
        cy.sverminalType('{backspace}'); //remove the 'a'
        cy.sverminalType('{backspace}'); //remove the leading whitespace
        cy.verifySelectionAndRange(2, ' \u200B');
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200B']);
        })
    })
    
    it('backspace from populated argument joins argument to previous item.', () => {
        cy.sverminalType('command arg');
        cy.moveCursorToStartOfCurrentElement();
        cy.sverminalType('{backspace}');
        cy.verifySelectionAndRange(9, ' \u200Bcommandarg');
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommandarg']);
        })
    })
  })