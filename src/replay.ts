//  Replay the recorded inference log
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as decorate from './decorate';

//  List of log entries to replay
let replayLog: string[] = [];

//  Current editor
//  let editor: vscode.TextEditor | undefined = undefined;

//  Current timeout
//  let timeout: NodeJS.Timer | undefined = undefined;

//  Called when VSCode is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('replay is activated');
    
    //  Read the entire replay log and break into lines.
    if (replayLog.length === 0) {
        const replayPath = path.join(__filename, '..', '..', 'resources', 'replay.log');
        const buf = fs.readFileSync(replayPath);
        const log = buf.toString();
        replayLog = log.split('\n');
        console.log('replay read log: ' + replayLog.length);    
    }

	let timeout: NodeJS.Timer | undefined = undefined;
	let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);
	function triggerUpdateDecorations() {
		if (timeout) {
            clearInterval(timeout);
			timeout = undefined;
		}
		timeout = setInterval(() => {
            if (activeEditor) {
                replay(activeEditor);
            }
        }, 5 * 1000);
	}

    /*
    //  Pause a while before replay, so user can switch to Rust editor.
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    timeout = setTimeout(() => {
        editor = vscode.window.activeTextEditor;
        if (!editor) { 
            console.log('replay no editor');
            return; 
        }    
        replay();
    }, 20 * 1000);
    */
}

let lastStartRow: number = 0;
let lastStartCol: number = 0;
let lastEndRow: number = 0;
let lastEndCol: number = 0;

function replay(editor: vscode.TextEditor) {
    //  Replay one line of the log.
    if (!editor) { return; }
    for (;;) {
        //  Look for lines starting with "#".
        if (replayLog.length === 0) { return; }
        const line = replayLog.shift();
        console.log('replay: ' + line);
        if (line === undefined || !line.startsWith('#')) { continue; }
        console.log('replay1: ' + line);

        if (line.startsWith("#s")) {
            //  Span: #s src/main.rs | 43 | 8 | 43 | 51
            const s = line.split('|');
            const startRow = parseInt(s[1]) - 1;
            const startCol = parseInt(s[2]); 
            const endRow = parseInt(s[3]) - 1; 
            const endCol = parseInt(s[4]);

            //  If unchanged, fetch next line.
            if (startRow === lastStartRow
                && startCol === lastStartCol
                && endRow === lastEndRow
                && endCol === lastEndCol) {
                continue;
            }

            //  Decorate the span.
            decorate.decorate(editor, startRow, startCol, endRow, endCol);
            lastStartRow = startRow;
            lastStartCol = startCol;
            lastEndRow = endRow;
            lastEndCol = endCol;
        } else if (line.startsWith("#m")) {
            //  Match: #m sensor::set_poll_rate_ms | src/main.rs | 43 | 8 | 43 | 51

        } else if (line.startsWith("#i")) {
            //  Infer: #i start_sensor_listener | sensor | sensor::set_poll_rate_ms | devname | &Strn

        } else { continue; }
        break;
    }
    /*
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    timeout = setTimeout(() => replay(), 10 * 1000);
    */
}