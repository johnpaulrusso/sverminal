
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
        cy.moveCursorToStartOfLastElement();
        cy.sverminalType(' ');
        cy.verifySelectionAndRange(3, ' \u200B command');
        cy.getActiveLine().then(commandLine => {
          cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200B command']);
        })
    
    })

    it('space key in the middle of lone command splits the text after the cursor into a new argument.', () => {
        cy.sverminalType('command');
        cy.moveCursorInLastElement(5);
        cy.sverminalType(' ');
        cy.verifySelectionAndRange(2, ' \u200Bmand');
        cy.getActiveLine().then(commandLine => {
          cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcom', ' \u200Bmand']);
        })

    })

    it('space key in the middle of a command before one or more arguments splits the text after the cursor into a new argument.', () => {
        cy.sverminalType('command');
        cy.sverminalType(' ');
        cy.sverminalType('a');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.verifySelectionAndRange(7, ' \u200Bcommand');
        cy.sverminalType(' ');
        cy.verifySelectionAndRange(2, ' \u200Bnd');
        cy.getActiveLine().then(commandLine => {
          cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcomma', ' \u200Bnd', ' \u200Ba']);
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
        cy.moveCursorToStartOfLastElement();
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
        cy.moveCursorToStartOfLastElement();
        cy.sverminalType(' '); //add leading whitespace
        cy.moveCursorInLastElement(4);
        cy.sverminalType('{backspace}'); //remove the 'a'
        cy.sverminalType('{backspace}'); //remove the leading whitespace
        cy.verifySelectionAndRange(2, ' \u200B');
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200B']);
        })
    })
    
    it('backspace from populated argument joins argument to previous item.', () => {
        cy.sverminalType('command arg');
        cy.moveCursorToStartOfLastElement();
        cy.sverminalType('{backspace}');
        cy.verifySelectionAndRange(9, ' \u200Bcommandarg');
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommandarg']);
        })
    })
  })


  describe('sverminal user action - LEFT ARROW', () => {

    it('left arrow key from the initial cursor position should do nothing.', () => {
        cy.sverminalType('{leftArrow}')
        cy.verifySelectionAndRange(2, ' \u200B');
    })
    
    it('left arrow through leading whitespace.', () => {
        cy.sverminalType(' ');
        cy.sverminalType('{leftArrow}');
        cy.verifySelectionAndRange(2, ' \u200B ');
    })

    it('left arrow through single character command.', () => {
        cy.sverminalType('c');
        cy.sverminalType('{leftArrow}');
        cy.verifySelectionAndRange(2, ' \u200Bc');
    })

    it('left arrows through multi character command.', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.verifySelectionAndRange(2, ' \u200Bcom');
    })

    it('left arrow from beginning of argument decrements the active item.', () => {
        cy.sverminalType('command');
        cy.sverminalType(' ');
        cy.sverminalType('a');
        cy.sverminalType('{leftArrow}'); //back to start of arg.
        cy.sverminalType('{leftArrow}'); 
        cy.verifySelectionAndRange(9, ' \u200Bcommand');
    })
  })

  describe('sverminal user action - RIGHT ARROW', () => {

    it('right arrow key from the initial cursor position should do nothing.', () => {
        cy.sverminalType('{rightArrow}')
        cy.verifySelectionAndRange(2, ' \u200B');
    })
    
    it('right arrow through leading whitespace.', () => {
        cy.sverminalType(' ');
        cy.moveCursorToStartOfLastElement();
        cy.sverminalType('{rightArrow}');
        cy.verifySelectionAndRange(3, ' \u200B ');
    })

    it('right arrow through single character command.', () => {
        cy.sverminalType('c');
        cy.moveCursorToStartOfLastElement();
        cy.sverminalType('{rightArrow}');
        cy.verifySelectionAndRange(3, ' \u200Bc');
    })

    it('right arrows through multi character command.', () => {
        cy.sverminalType('com');
        cy.moveCursorToStartOfLastElement();
        cy.sverminalType('{rightArrow}');
        cy.sverminalType('{rightArrow}');
        cy.sverminalType('{rightArrow}');
        cy.verifySelectionAndRange(5, ' \u200Bcom');
    })

    it('right arrow from end of argument increments the active item.', () => {
        cy.sverminalType('command');
        cy.sverminalType(' ');
        cy.sverminalType('a');
        cy.sverminalType('{leftArrow}'); //back to start of arg.
        cy.sverminalType('{leftArrow}'); 
        cy.sverminalType('{rightArrow}'); 
        cy.verifySelectionAndRange(2, ' \u200Ba');
    })
  })

  describe.only('sverminal user action - PASTE', () => {

    it('paste empty clipboard into an empty line', () => {
        cy.sverminalPaste('')
        cy.verifySelectionAndRange(2, ' \u200B');  
    })

    it('paste whitespace into an empty line', () => { 
        cy.sverminalPaste(' ')
        cy.verifySelectionAndRange(3, ' \u200B ');
    })

    it('paste single character into an empty line', () => {
        cy.sverminalPaste('c')
        cy.verifySelectionAndRange(3, ' \u200Bc');
    })

    it('paste single word into an empty line', () => {
        cy.sverminalPaste('command')
        cy.verifySelectionAndRange(9, ' \u200Bcommand');
    })

    it('paste two words into an empty line', () => {
        cy.sverminalPaste('command arg')
        cy.verifySelectionAndRange(5, ' \u200Barg');
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200Barg']);
        })
    })

    it('paste three words into an empty line', () => {
        cy.sverminalPaste('command arg1 arg2')
        cy.verifySelectionAndRange(6, ' \u200Barg2');
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200Barg1', ' \u200Barg2']);
        })
    })

    it('paste two words with extra spaces into an empty line', () => {
        cy.sverminalPaste('command   arg')
        cy.verifySelectionAndRange(7, ' \u200B  arg');
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200B  arg']);
        })
    })

    it('paste two words with tab spaces into an empty line', () => {
        cy.sverminalPaste("command  arg")
        cy.verifySelectionAndRange(6, ' \u200B arg'); 
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcommand', ' \u200B arg']);
        })
    })

    it('paste empty clipboard at beginning of existing line', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('')
        cy.verifySelectionAndRange(2, ' \u200Bcom');  
    })

    it('paste whitespace at beginning of existing line', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste(' ')
        cy.verifySelectionAndRange(3, ' \u200B com');  
    })

    it('paste single character at beginning of existing line', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('m')
        cy.verifySelectionAndRange(3, ' \u200Bmcom');  
    })

    it('paste single word at beginning of existing line', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('mand')
        cy.verifySelectionAndRange(6, ' \u200Bmandcom');  
    })

    it('paste two words at beginning of existing line', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('hello world')
        cy.verifySelectionAndRange(7, ' \u200Bworldcom');  
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bhello', ' \u200Bworldcom']);
        })
    })

    it('paste three words at beginning of existing line', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('hello world again')
        cy.verifySelectionAndRange(7, ' \u200Bagaincom');  
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bhello', ' \u200Bworld', ' \u200Bagaincom']);
        })
    })

    it('paste two words with extra spaces at beginning of existing line', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('hello   world')
        cy.verifySelectionAndRange(9, ' \u200B  worldcom');  
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bhello', ' \u200B  worldcom']);
        })
    })

    it('paste empty clipboard in the middle of an existing word', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('')
        cy.verifySelectionAndRange(4, ' \u200Bcom');  
    })

    it('paste whitespace in the middle of an existing word', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste(' ')
        cy.verifySelectionAndRange(2, ' \u200Bm');  
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bco', ' \u200Bm']);
        })
    })

    it('paste single character in the middle of an existing word', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('x')
        cy.verifySelectionAndRange(5, ' \u200Bcoxm');  
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcoxm']);
        })
    })

    it('paste single word in the middle of an existing word', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('hello')
        cy.verifySelectionAndRange(9, ' \u200Bcohellom');  
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcohellom']);
        })
    })

    it('paste two words in the middle of an existing word', () => {
        cy.sverminalType('com');
        cy.sverminalType('{leftArrow}');
        cy.sverminalPaste('hello world')
        cy.verifySelectionAndRange(7, ' \u200Bworldm');  
        cy.getActiveLine().then(commandLine => {
            cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bcohello', ' \u200Bworldm']);
        })
    })

  }) 