export function selectionHasNonZeroRange(): boolean {
	if (!window) {
		return false;
	}

	const selection = window.getSelection();
	if (!selection) {
		return false;
	}

	if (selection.rangeCount > 1) {
		return true;
	}

	const range = selection.getRangeAt(0);
	const rangeSize = range.endOffset - range.startOffset;

	return rangeSize != 0;
}
