beforeEach(() => {
    cy.visit('http://localhost:5173/');
})

describe('sverminal additional command input tests', () => {

    it('user can submit an empty additional input for a command when prompted.', () => {
        cy.sverminalType('input-demo');
        cy.sverminalType('{enter}');

        cy.sverminalType('{enter}');
        cy.sverminalType('{enter}');
        cy.sverminalType('{enter}');

        cy.wait(500);

        cy.verifySelectionAndRange(2, ' \u200B');
        cy.getActiveLine().then(commandLine => {
          cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200B']);
        })
    })

    it('history works after an input command', () => {
        cy.sverminalType('input-demo');
        cy.sverminalType('{enter}');

        cy.sverminalType('test');
        cy.sverminalType('{enter}');

        cy.sverminalType('test');
        cy.sverminalType('{enter}');

        cy.sverminalType('test');
        cy.sverminalType('{enter}');

        cy.sverminalType('{upArrow}');
        cy.verifySelectionAndRange(12, ' \u200Binput-demo');
        cy.getActiveLine().then(commandLine => {
          cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Binput-demo']);
        })
    })

})