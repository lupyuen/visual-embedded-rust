// Need to install into `media` folder: `blockly-mynewt-rust`, `closure-library`

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as web from './web';
import * as decorate from './decorate';
import { DeclarationsProvider, Node } from './declarations';

const cats = {
	'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
	'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
	'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "visual-embedded-rust" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('visualEmbeddedRust.start', () => {
			CatCodingPanel.createOrShow(context.extensionPath);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('visualEmbeddedRust.doRefactor', () => {
			if (CatCodingPanel.currentPanel) {
				CatCodingPanel.currentPanel.doRefactor();
			}
		})
	);

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				CatCodingPanel.revive(webviewPanel, context.extensionPath);
			}
		});
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('visualEmbeddedRust.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);

	// Call the decorators.
	decorate.activate(context);

	// Register the provider for a Tree View
	const declarationsProvider = new DeclarationsProvider(vscode.workspace.rootPath || '');
	vscode.window.registerTreeDataProvider('visualEmbeddedRustDeclarations', declarationsProvider);
	vscode.commands.registerCommand('visualEmbeddedRustDeclarations.refreshEntry', () => declarationsProvider.refresh());
	vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
	vscode.commands.registerCommand('visualEmbeddedRustDeclarations.addEntry', () => vscode.window.showInformationMessage(`Successfully called add entry.`));
	vscode.commands.registerCommand('visualEmbeddedRustDeclarations.editEntry', (node: Node) => vscode.window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
	vscode.commands.registerCommand('visualEmbeddedRustDeclarations.deleteEntry', (node: Node) => vscode.window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));
}

/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: CatCodingPanel | undefined;

	public static readonly viewType = 'catCoding';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];
	private _editor: vscode.TextEditor | undefined;

	public static createOrShow(extensionPath: string) {
		console.log('createOrShow');
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (CatCodingPanel.currentPanel) {
			CatCodingPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			CatCodingPanel.viewType,
			'Cat Coding',
			column || vscode.ViewColumn.One,
			{
				// Enable javascript in the webview
				enableScripts: true,

				// And restrict the webview to only loading content from our extension's `media` directory.
				localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
			}
		);

		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionPath);
	}

	public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
		console.log('revive');
		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionPath);
	}

	private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
		this._panel = panel;
		this._extensionPath = extensionPath;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				console.log('onDidChangeViewState');
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				console.log(JSON.stringify({onDidReceiveMessage: JSON.stringify(message).substr(0, 50)}));
				switch (message.command) {
					case 'alert': {
						vscode.window.showErrorMessage(message.text);
						return;
					}
					
					//  Restore code blocks. Read the contexts of the active text editor and send to webview to load.
					case 'restoreBlocks': {
						// Get the active text editor. If none active, return the last active one.
						let editor = vscode.window.activeTextEditor;
						if (!editor || !CatCodingPanel._isValidEditor(editor)) { 
							editor = this._editor; 
							if (!editor || !CatCodingPanel._isValidEditor(editor)) { console.log('No active editor'); return; }
						}

						// Get the text of the doc.
						const text = editor.document.getText();
						if (!text) { console.log('Missing text'); return; }

						//  Remember the active text editor. We will return this at the next call.
						this._editor = editor;

						// Send a `load` message to our webview with the text.
						this._panel.webview.postMessage({ 
							command: 'loadDoc',
							text:    text,
						});
						return;
					}	

					//  Update the Visual Rust document with the generated Rust code and the updated blocks XML.
					case 'updateDoc': {
						const newText = message.text;
						let editor = this._editor;
						if (!editor || !CatCodingPanel._isValidEditor(editor)) { console.log('No editor to update'); return; }
						editor.edit(editBuilder => {
							//  Get the range of the entire doc.
							if (!editor) { console.log('Missing editor'); return; }
							const document = editor.document;
							const text = document.getText();
							if (!text) { console.log('Missing text'); return; }
							const range = new vscode.Range(
								new vscode.Position(0, 0), 
								document.positionAt(text.length)
							);
							//  Replace the range by the new text.
							editBuilder.replace(range, newText);
						});	
						return;
					}
					
					//  Show an OK/Cancel confirmation message. Post the result (true for OK) back to WebView.
					case 'confirm': {
						const msg = message.message;
						vscode.window.showInformationMessage(msg, 'OK', 'Cancel')
							.then(selected => this._panel.webview.postMessage({ 
								command: 'confirmResult',
								result:  (selected === 'OK'),
							}));
						return;						
					}					

					//  Prompt for input. Post the result back to WebView.
					case 'prompt': {
						const msg = message.message;
						const defaultValue = message.defaultValue;
						vscode.window.showInputBox({
							prompt: message,
							value:  defaultValue,        
						})
							.then(result => this._panel.webview.postMessage({ 
								command: 'promptResult',
								result:  result,
							}));
						return;						
					}					

					default: console.error('Unknown message: ' + JSON.stringify(message));											
				}
			},
			null,
			this._disposables
		);
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		CatCodingPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private static _isValidEditor(editor: vscode.TextEditor): boolean {
		// Return true if this is a valid TextEditor with a valid *.rs Visual Rust program.
		// If filename is not *.rs, reuse the last active editor.
		if (!editor.document) { console.log('Missing document'); return false; }
		const filename = editor.document.fileName;
		if (!filename) { console.log('Missing filename'); return false; } 
		if (!filename.endsWith(".rs") && !filename.endsWith(".RS")) { console.log('Not a .rs file'); return false; }							

		// Get the text of the doc.
		const text = editor.document.getText();
		if (!text) { console.log('Missing text'); return false; }
		return true;
	}

	private _update() {
		const z = 1 + 2;
		// Vary the webview's content based on where it is located in the editor.
		switch (this._panel.viewColumn) {
			case vscode.ViewColumn.Two:
				this._updateForCat('Compiling Cat');
				return;

			case vscode.ViewColumn.Three:
				this._updateForCat('Testing Cat');
				return;

			case vscode.ViewColumn.One:
			default:
				this._updateForCat('Coding Cat');
				return;
		}
	}

	private _updateForCat(catName: keyof typeof cats) {
		this._panel.title = 'Visual Embedded Rust';
		this._panel.webview.html = this._getHtmlForWebview(cats[catName]);
	}

	private _getHtmlForWebview(catGif: string) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.file(
			path.join(this._extensionPath, 'media')
		);
		// Parameters for the HTML
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
		const para = {
			// URIs we use to load this script in the webview
			vscodeUri:  scriptUri + '/vscode',  //  VSCode integration scripts
			blocklyUri: scriptUri + '/blockly-mynewt-rust',  //  Blockly scripts

			// Use a nonce to whitelist which scripts can be run
			nonce: getNonce(),
		};
		//  Return the HTML with the parameters embedded.
		return web.getHtml(para);
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

// this method is called when your extension is deactivated
export function deactivate() {}
