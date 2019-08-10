import * as vscode from 'vscode';

// create a decorator type that we use to decorate small numbers
const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
	borderWidth: '1px',
	borderStyle: 'solid',
	overviewRulerColor: 'blue',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	light: {
		// this color will be used in light color themes
		borderColor: 'darkblue'
	},
	dark: {
		// this color will be used in dark color themes
		borderColor: 'lightblue'
	}
});

// create a decorator type that we use to decorate large numbers
const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
	cursor: 'crosshair',
	// use a themable color. See package.json for the declaration and default values.
	backgroundColor: { id: 'visualEmbeddedRust.largeNumberBackground' }
});

export function decorate(editor: vscode.TextEditor, startLine: number, startCol: number, endLine: number, endCol: number) {
	//  Apply decoration to the active editor.  All numbers are zero-based.
	if (!editor) { return; }
	const smallNumbers: vscode.DecorationOptions[] = [];
	const largeNumbers: vscode.DecorationOptions[] = [];

	const startPos = new vscode.Position(startLine, startCol);
	const endPos = new vscode.Position(endLine, endCol);
	const decoration = { 
		range: new vscode.Range(startPos, endPos), 
		hoverMessage: '' 
	};
	largeNumbers.push(decoration);
	editor.setDecorations(smallNumberDecorationType, smallNumbers);
	editor.setDecorations(largeNumberDecorationType, largeNumbers);
}

// Called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
	//  console.log('decorate is activated');

	/*
	let timeout: NodeJS.Timer | undefined = undefined;

	let activeEditor = vscode.window.activeTextEditor;

	if (activeEditor) {
		//  triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			//  triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			//  triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		const regEx = /\d+/g;
		const text = activeEditor.document.getText();
		const smallNumbers: vscode.DecorationOptions[] = [];
		const largeNumbers: vscode.DecorationOptions[] = [];
		let match;
		while (match = regEx.exec(text)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
			if (match[0].length < 3) {
				largeNumbers.push(decoration);
			} else {
				largeNumbers.push(decoration);
			}
        }
		activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
		activeEditor.setDecorations(largeNumberDecorationType, largeNumbers);
	}
	

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}
	*/
}
