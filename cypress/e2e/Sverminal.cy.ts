
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

describe('template spec', () => {
  it('sverminal initialization', () => {
    cy.visit('http://localhost:5173/');

    const element = cy.get('.sverminal-main');

    element.should('not.be.null');

    //Verify the initial command line spans.
    element.children().should('have.length', 1);
    cy.get('.sverminal-main').then(element => {
        const commandLine = element.children().last();
        expect(commandLine.children().length).equals(2);

        commandLine.children().toArray().forEach((lineElement, index) => {
            expect(lineElement.tagName).equals('SPAN')
            if(index == 0){
                expect(lineElement.innerHTML).equals('sverminal&gt;');
            } else if (index == 1){
                expect(lineElement.innerHTML).equals(' \u200B');
            }
        })
    });

    //Verify the initial cursor location.
    verifySelectionAndRange(2, ' \u200B');

  })

  it('space key from the initial cursor position adds whitespace to the command.', () => {
    cy.visit('http://localhost:5173/');

    const element = cy.get('.sverminal-main').type(' ')

    //Verify the initial cursor location.
    verifySelectionAndRange(3, ' \u200B ');

  })

  it('left arrow key from the initial cursor position should do nothing.', () => {
    cy.visit('http://localhost:5173/');

    const element = cy.get('.sverminal-main').type('{leftArrow}')

    //Verify the initial cursor location.
    verifySelectionAndRange(2, ' \u200B');

  })

  it('right arrow key from the initial cursor position should do nothing.', () => {
    cy.visit('http://localhost:5173/');

    const element = cy.get('.sverminal-main').type('{rightArrow}')

    //Verify the initial cursor location.
    verifySelectionAndRange(2, ' \u200B');

  })

  it('backspace from the initial cursor position should do nothing.', () => {
    cy.visit('http://localhost:5173/');

    const element = cy.get('.sverminal-main').type('{backspace}')

    //Verify the initial cursor location.
    verifySelectionAndRange(2, ' \u200B');

  })

  it('up arrow from the initial cursor position should do nothing if no history is present.', () => {
    cy.visit('http://localhost:5173/');

    const element = cy.get('.sverminal-main').type('{upArrow}')

    //Verify the initial cursor location.
    verifySelectionAndRange(2, ' \u200B');

  })

  it('down arrow from the initial cursor position should do nothing if no history is present.', () => {
    cy.visit('http://localhost:5173/');

    const element = cy.get('.sverminal-main').type('{upArrow}')

    //Verify the initial cursor location.
    verifySelectionAndRange(2, ' \u200B');

  })

})