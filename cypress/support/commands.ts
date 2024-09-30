/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

export const STARTING_CURSOR_OFFSET = 2;

Cypress.Commands.add('verifySelectionAndRange', (expectedOffset: number, expectedText: string) => {
	cy.window().then((window) => {
		const selection = window.getSelection();
		expect(selection.rangeCount).equals(1);

		const range = selection.getRangeAt(0);
		expect(range.commonAncestorContainer.textContent).equals(expectedText);
		expect(range.startOffset).equals(expectedOffset);
	});
});

Cypress.Commands.add('verifyLineContent', (line: JQuery<HTMLElement>, expectedText: string[]) => {
	expect(line.children().length).equals(expectedText.length);
	line
		.children()
		.toArray()
		.forEach((child, index) => {
			expect(child.tagName).equals('SPAN');
			expect(child.innerHTML).equals(expectedText[index]);
		});
});

Cypress.Commands.add('getActiveLine', (): Cypress.Chainable<JQuery<HTMLElement>> => {
	return cy.get('.sverminal-main').children().last();
});

Cypress.Commands.add('moveCursorToStartOfLastElement', () => {
	cy.moveCursorInLastElement(STARTING_CURSOR_OFFSET);
});

Cypress.Commands.add('moveCursorInLastElement', (offset: number) => {
	cy.getActiveLine().then((commandLine) => {
		let argument = commandLine.children().last();
		cy.setCursor(argument, offset);
	});
});

Cypress.Commands.add('setCursor', (element: JQuery<HTMLElement>, offset: number) => {
	cy.window().then((window) => {
		const selection = window.getSelection();
		const range = window.document.createRange();
		range.setStart(element.get(0).firstChild, offset);
		range.collapse(true);
		selection?.removeAllRanges();
		selection?.addRange(range);
	});
});

Cypress.Commands.add('sverminalType', (text: string) => {
	cy.get('.sverminal-main')
		.should('be.visible')
		.wait(100) //Making this shorter can cause random failures on chromium browsers.
		.type(text, { delay: 10 });
});

Cypress.Commands.add('paste', { prevSubject: true }, (subject, text: string) => {
	const pasteEvent = new ClipboardEvent('paste', {
		bubbles: true,
		cancelable: true,
		clipboardData: new DataTransfer()
	});

	pasteEvent.clipboardData.setData('text/plain', text);

	subject[0].dispatchEvent(pasteEvent);
	return cy.wrap(subject);
});

Cypress.Commands.add('sverminalPaste', (text: string) => {
	cy.wait(100); //This is required for tests to pass on chromium browsers.
	cy.get('.sverminal-main')
		.should('be.visible')
		.wait(100) //Making this shorter can cause random failures on chromium browsers.
		.focus() //This is required for tests to pass on chromium browsers.
		.paste(text);
	cy.wait(100);
});

declare global {
	namespace Cypress {
		interface Chainable {
			sverminalType(text: string): Chainable<void>;
			setCursor(element: JQuery<HTMLElement>, offset: number): Chainable<void>;
			moveCursorInLastElement(offset: number): Chainable<void>;
			moveCursorToStartOfLastElement(): Chainable<void>;
			getActiveLine(): Chainable<JQuery<HTMLElement>>;
			verifyLineContent(line: JQuery<HTMLElement>, expectedText: string[]): Chainable<void>;
			verifySelectionAndRange(expectedOffset: number, expectedText: string): Chainable<void>;
			sverminalPaste(text: string): Chainable<void>;
		}
		interface Chainable<Subject> {
			paste(text: string): Chainable<Subject>;
		}
	}
}
