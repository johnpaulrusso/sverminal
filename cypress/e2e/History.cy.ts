beforeEach(() => {
	cy.visit('http://localhost:5173/');
	cy.sverminalType('hello world');
	cy.sverminalType('{enter}');
	cy.sverminalType('echo my message');
	cy.sverminalType('{enter}');
	cy.sverminalType('test');
	cy.sverminalType('{enter}');
	cy.sverminalType('test');
	cy.sverminalType('{enter}');
});

describe('sverminal history - USER ACTIONS UP AND DOWN ARROWS', () => {
	it('history up once', () => {
		cy.sverminalType('{upArrow}');
		cy.verifySelectionAndRange(6, ' \u200Btest');
		cy.getActiveLine().then((commandLine) => {
			cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Btest']);
		});
	});

	it('history up twice', () => {
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');
		cy.verifySelectionAndRange(9, ' \u200Bmessage');
		cy.getActiveLine().then((commandLine) => {
			cy.verifyLineContent(commandLine, [
				'sverminal&gt;',
				' \u200Becho',
				' \u200Bmy',
				' \u200Bmessage'
			]);
		});
	});

	it('history up three times', () => {
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');
		cy.verifySelectionAndRange(7, ' \u200Bworld');
		cy.getActiveLine().then((commandLine) => {
			cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bhello', ' \u200Bworld']);
		});
	});

	it('history sweep up to end of history', () => {
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');

		//Bounds check.
		cy.sverminalType('{upArrow}');
		cy.verifySelectionAndRange(7, ' \u200Bworld');
		cy.getActiveLine().then((commandLine) => {
			cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Bhello', ' \u200Bworld']);
		});
	});

	it('history down from start', () => {
		cy.sverminalType('{downArrow}');
		cy.verifySelectionAndRange(2, ' \u200B');
		cy.getActiveLine().then((commandLine) => {
			cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200B']);
		});
	});

	it('history up once down once from start', () => {
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{downArrow}');
		cy.verifySelectionAndRange(6, ' \u200Btest');
		cy.getActiveLine().then((commandLine) => {
			cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Btest']);
		});
	});

	it('history up twice down once from start', () => {
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{downArrow}');
		cy.verifySelectionAndRange(6, ' \u200Btest');
		cy.getActiveLine().then((commandLine) => {
			cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Btest']);
		});
	});

	it('history up three times down once from start', () => {
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{downArrow}');
		cy.verifySelectionAndRange(9, ' \u200Bmessage');
		cy.getActiveLine().then((commandLine) => {
			cy.verifyLineContent(commandLine, [
				'sverminal&gt;',
				' \u200Becho',
				' \u200Bmy',
				' \u200Bmessage'
			]);
		});
	});

	it('history full sweep', () => {
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{upArrow}');
		cy.sverminalType('{downArrow}');
		cy.sverminalType('{downArrow}');
		cy.sverminalType('{downArrow}');
		cy.verifySelectionAndRange(6, ' \u200Btest');
		cy.getActiveLine().then((commandLine) => {
			cy.verifyLineContent(commandLine, ['sverminal&gt;', ' \u200Btest']);
		});
	});
});
