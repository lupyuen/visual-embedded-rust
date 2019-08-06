// Need to install into `media` folder: `blockly-mynewt-rust`, `closure-library`

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

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
		vscode.commands.registerCommand('catCoding.start', () => {
			CatCodingPanel.createOrShow(context.extensionPath);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.doRefactor', () => {
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
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
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

	public static createOrShow(extensionPath: string) {
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
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
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
			path.join(this._extensionPath, 'media', 'blockly-mynewt-rust')
		);

		// And the uri we use to load this script in the webview
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		//  From media/blockly-mynewt-rust/demos/code/index.html
		//  TODO: Add security policy
		return `<!DOCTYPE html>
		<html>
		<head>
		  <meta charset="utf-8">
		  <meta name="google" value="notranslate">
		  <title>Blockly Demo:</title>
		  <link rel="stylesheet" href="${scriptUri}/demos/code/style.css">
		  
		  <!-- TODO: Storage Functions
		  <TODO script nonce="${nonce}" src="${scriptUri}/demos/code/storage.js"></script>
		  -->

		  <!--  Load Blockly and Google Closure  -->
		  <script nonce="${nonce}" src="${scriptUri}/blockly_uncompressed.js"></script>

		  <!--  Need to load language explicitly for VSCode  -->
		  <script nonce="${nonce}" src="${scriptUri}/msg/js/en.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/demos/code/msg/en.js"></script>

		  <script nonce="${nonce}" src="${scriptUri}/blocks_compressed.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/javascript_compressed.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/python_compressed.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/php_compressed.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/lua_compressed.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/dart_compressed.js"></script>
		  <!--  Load Rust Code Generator  -->
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust.js"></script>
		  <!--  Load Mynewt Blocks  -->
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/mynewt_blocks.js"></script>
		  <!--  Load Mynewt Functions  -->
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/mynewt_functions.js"></script>
		  <!--  Load Rust Functions. TODO: Package into rust_compressed.js  -->
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/colour.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/lists.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/logic.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/loops.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/math.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/procedures.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/text.js"></script>
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/variables.js"></script>  
		  <script nonce="${nonce}" src="${scriptUri}/generators/rust/variables_dynamic.js"></script>
		  <!--  TODO: End  -->
		  <script nonce="${nonce}" src="${scriptUri}/demos/code/code.js"></script>
		</head>
		<body>
		  <table width="100%" height="100%">
			<tr>
			  <td>
				<h1><a href="https://developers.google.com/blockly/">Blockly</a>&rlm; &gt;
				  <a href="../index.html">Demos</a>&rlm; &gt;
				  <span id="title">...</span>
				</h1>
			  </td>
			  <td class="farSide">
				<select id="languageMenu"></select>
			  </td>
			</tr>
			<tr>
			  <td colspan=2>
				<table width="100%">
				  <tr id="tabRow" height="1em">
					<td id="tab_blocks" class="tabon">...</td>
					<td class="tabmin">&nbsp;</td>
					<td id="tab_rust" class="taboff">Rust</td>
					<td class="tabmin">&nbsp;</td>
					<td id="tab_javascript" class="taboff">JavaScript</td>
					<td class="tabmin">&nbsp;</td>
					<td style="display: none" id="tab_python" class="taboff">Python</td>
					<td style="display: none" class="tabmin">&nbsp;</td>
					<td style="display: none" id="tab_php" class="taboff">PHP</td>
					<td style="display: none" class="tabmin">&nbsp;</td>
					<td style="display: none" id="tab_lua" class="taboff">Lua</td>
					<td style="display: none" class="tabmin">&nbsp;</td>
					<td style="display: none" id="tab_dart" class="taboff">Dart</td>
					<td style="display: none" class="tabmin">&nbsp;</td>
					<td id="tab_xml" class="taboff">XML</td>
					<td class="tabmax">
					  <button id="trashButton" class="notext" title="...">
						<img src='../../media/1x1.gif' class="trash icon21">
					  </button>
					  <button id="linkButton" class="notext" title="...">
						<img src='../../media/1x1.gif' class="link icon21">
					  </button>
					  <button id="runButton" class="notext primary" title="...">
						<img src='../../media/1x1.gif' class="run icon21">
					  </button>
					</td>
				  </tr>
				</table>
			  </td>
			</tr>
			<tr>
			  <td height="99%" colspan=2 id="content_area">
			  </td>
			</tr>
		  </table>
		  <div id="content_blocks" class="content"></div>
		  <pre id="content_rust" class="content"></pre>
		  <pre id="content_javascript" class="content"></pre>
		  <pre id="content_python" class="content"></pre>
		  <pre id="content_php" class="content"></pre>
		  <pre id="content_lua" class="content"></pre>
		  <pre id="content_dart" class="content"></pre>
		  <textarea id="content_xml" class="content" wrap="off"></textarea>
		
		  <xml id="toolbox" style="display: none">
			<!--  Begin: Pins Category -->
			<category name="Pins" colour="330">
				<block type="digital_read_pin"></block>
				<block type="digital_write_pin"></block>
				<block type="digital_toggle_pin"></block>
			</category>
			<!--  End  -->
		
			<category name="%{BKY_CATLOGIC}" colour="%{BKY_LOGIC_HUE}">
			  <block type="controls_if"></block>
			  <block type="logic_compare"></block>
			  <block type="logic_operation"></block>
			  <block type="logic_negate"></block>
			  <block type="logic_boolean"></block>
			  <block type="logic_null"></block>
			  <block type="logic_ternary"></block>
			</category>
			<category name="%{BKY_CATLOOPS}" colour="%{BKY_LOOPS_HUE}">
		
			  <!--  Begin: Forever and On Start -->
			  <block type="on_start"></block>
			  <block type="forever"></block>
			  <!--  End -->
		
			  <block type="controls_repeat_ext">
				<value name="TIMES">
				  <shadow type="math_number">
					<field name="NUM">10</field>
				  </shadow>
				</value>
			  </block>
			  <block type="controls_whileUntil"></block>
			  <block type="controls_for">
				<value name="FROM">
				  <shadow type="math_number">
					<field name="NUM">1</field>
				  </shadow>
				</value>
				<value name="TO">
				  <shadow type="math_number">
					<field name="NUM">10</field>
				  </shadow>
				</value>
				<value name="BY">
				  <shadow type="math_number">
					<field name="NUM">1</field>
				  </shadow>
				</value>
			  </block>
			  <block type="controls_forEach"></block>
			  <block type="controls_flow_statements"></block>
			</category>
			<category name="%{BKY_CATMATH}" colour="%{BKY_MATH_HUE}">
			  <block type="math_number">
				<field name="NUM">123</field>
			  </block>
			  <block type="math_arithmetic">
				<value name="A">
				  <shadow type="math_number">
					<field name="NUM">1</field>
				  </shadow>
				</value>
				<value name="B">
				  <shadow type="math_number">
					<field name="NUM">1</field>
				  </shadow>
				</value>
			  </block>
			  <block type="math_single">
				<value name="NUM">
				  <shadow type="math_number">
					<field name="NUM">9</field>
				  </shadow>
				</value>
			  </block>
			  <block type="math_trig">
				<value name="NUM">
				  <shadow type="math_number">
					<field name="NUM">45</field>
				  </shadow>
				</value>
			  </block>
			  <block type="math_constant"></block>
			  <block type="math_number_property">
				<value name="NUMBER_TO_CHECK">
				  <shadow type="math_number">
					<field name="NUM">0</field>
				  </shadow>
				</value>
			  </block>
			  <block type="math_round">
				<value name="NUM">
				  <shadow type="math_number">
					<field name="NUM">3.1</field>
				  </shadow>
				</value>
			  </block>
			  <block type="math_on_list"></block>
			  <block type="math_modulo">
				<value name="DIVIDEND">
				  <shadow type="math_number">
					<field name="NUM">64</field>
				  </shadow>
				</value>
				<value name="DIVISOR">
				  <shadow type="math_number">
					<field name="NUM">10</field>
				  </shadow>
				</value>
			  </block>
			  <block type="math_constrain">
				<value name="VALUE">
				  <shadow type="math_number">
					<field name="NUM">50</field>
				  </shadow>
				</value>
				<value name="LOW">
				  <shadow type="math_number">
					<field name="NUM">1</field>
				  </shadow>
				</value>
				<value name="HIGH">
				  <shadow type="math_number">
					<field name="NUM">100</field>
				  </shadow>
				</value>
			  </block>
			  <block type="math_random_int">
				<value name="FROM">
				  <shadow type="math_number">
					<field name="NUM">1</field>
				  </shadow>
				</value>
				<value name="TO">
				  <shadow type="math_number">
					<field name="NUM">100</field>
				  </shadow>
				</value>
			  </block>
			  <block type="math_random_float"></block>
			  <block type="math_atan2">
				<value name="X">
				  <shadow type="math_number">
					<field name="NUM">1</field>
				  </shadow>
				</value>
				<value name="Y">
				  <shadow type="math_number">
					<field name="NUM">1</field>
				  </shadow>
				</value>
			  </block>
			</category>
			<category name="%{BKY_CATTEXT}" colour="%{BKY_TEXTS_HUE}">
			  <block type="text"></block>
			  <block type="text_join"></block>
			  <block type="text_append">
				<value name="TEXT">
				  <shadow type="text"></shadow>
				</value>
			  </block>
			  <block type="text_length">
				<value name="VALUE">
				  <shadow type="text">
					<field name="TEXT">abc</field>
				  </shadow>
				</value>
			  </block>
			  <block type="text_isEmpty">
				<value name="VALUE">
				  <shadow type="text">
					<field name="TEXT"></field>
				  </shadow>
				</value>
			  </block>
			  <block type="text_indexOf">
				<value name="VALUE">
				  <block type="variables_get">
					<field name="VAR">{textVariable}</field>
				  </block>
				</value>
				<value name="FIND">
				  <shadow type="text">
					<field name="TEXT">abc</field>
				  </shadow>
				</value>
			  </block>
			  <block type="text_charAt">
				<value name="VALUE">
				  <block type="variables_get">
					<field name="VAR">{textVariable}</field>
				  </block>
				</value>
			  </block>
			  <block type="text_getSubstring">
				<value name="STRING">
				  <block type="variables_get">
					<field name="VAR">{textVariable}</field>
				  </block>
				</value>
			  </block>
			  <block type="text_changeCase">
				<value name="TEXT">
				  <shadow type="text">
					<field name="TEXT">abc</field>
				  </shadow>
				</value>
			  </block>
			  <block type="text_trim">
				<value name="TEXT">
				  <shadow type="text">
					<field name="TEXT">abc</field>
				  </shadow>
				</value>
			  </block>
			  <block type="text_print">
				<value name="TEXT">
				  <shadow type="text">
					<field name="TEXT">abc</field>
				  </shadow>
				</value>
			  </block>
			  <block type="text_prompt_ext">
				<value name="TEXT">
				  <shadow type="text">
					<field name="TEXT">abc</field>
				  </shadow>
				</value>
			  </block>
			</category>
			<category name="%{BKY_CATLISTS}" colour="%{BKY_LISTS_HUE}">
			  <block type="lists_create_with">
				<mutation items="0"></mutation>
			  </block>
			  <block type="lists_create_with"></block>
			  <block type="lists_repeat">
				<value name="NUM">
				  <shadow type="math_number">
					<field name="NUM">5</field>
				  </shadow>
				</value>
			  </block>
			  <block type="lists_length"></block>
			  <block type="lists_isEmpty"></block>
			  <block type="lists_indexOf">
				<value name="VALUE">
				  <block type="variables_get">
					<field name="VAR">{listVariable}</field>
				  </block>
				</value>
			  </block>
			  <block type="lists_getIndex">
				<value name="VALUE">
				  <block type="variables_get">
					<field name="VAR">{listVariable}</field>
				  </block>
				</value>
			  </block>
			  <block type="lists_setIndex">
				<value name="LIST">
				  <block type="variables_get">
					<field name="VAR">{listVariable}</field>
				  </block>
				</value>
			  </block>
			  <block type="lists_getSublist">
				<value name="LIST">
				  <block type="variables_get">
					<field name="VAR">{listVariable}</field>
				  </block>
				</value>
			  </block>
			  <block type="lists_split">
				<value name="DELIM">
				  <shadow type="text">
					<field name="TEXT">,</field>
				  </shadow>
				</value>
			  </block>
			  <block type="lists_sort"></block>
			</category>
			<category name="%{BKY_CATCOLOUR}" colour="%{BKY_COLOUR_HUE}">
			  <block type="colour_picker"></block>
			  <block type="colour_random"></block>
			  <block type="colour_rgb">
				<value name="RED">
				  <shadow type="math_number">
					<field name="NUM">100</field>
				  </shadow>
				</value>
				<value name="GREEN">
				  <shadow type="math_number">
					<field name="NUM">50</field>
				  </shadow>
				</value>
				<value name="BLUE">
				  <shadow type="math_number">
					<field name="NUM">0</field>
				  </shadow>
				</value>
			  </block>
			  <block type="colour_blend">
				<value name="COLOUR1">
				  <shadow type="colour_picker">
					<field name="COLOUR">#ff0000</field>
				  </shadow>
				</value>
				<value name="COLOUR2">
				  <shadow type="colour_picker">
					<field name="COLOUR">#3333ff</field>
				  </shadow>
				</value>
				<value name="RATIO">
				  <shadow type="math_number">
					<field name="NUM">0.5</field>
				  </shadow>
				</value>
			  </block>
			</category>
		
			<!--  Begin: Control Category -->
			<category name="Control" colour="160">
				<block type="wait"></block>
			</category>
			<!--  End  -->
		
			<sep></sep>
			<category name="%{BKY_CATVARIABLES}" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE"></category>
			<category name="%{BKY_CATFUNCTIONS}" colour="%{BKY_PROCEDURES_HUE}" custom="PROCEDURE"></category>
		  </xml>
		
		</body>
		</html>		
		`;
		/*
		return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';">

                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cat Coding</title>
            </head>
            <body>
                <img src="${catGif}" width="300" />
                <h1 id="lines-of-code-counter">0</h1>

                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
			</html>`;
		*/
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
