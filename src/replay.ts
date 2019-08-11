//  Replay the recorded inference log
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as decorate from './decorate';
import * as declarations from './declarations';

//  List of log entries to replay
let replayLog: string[] = [];

//  List of interpolated spans to replay
let interpolatedSpans: number[][] = [];

//  Span color: 0 for red, 1 for green
let spanColor: number = 0;

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

    //  Trigger the replay when document is active.
	let timeout: NodeJS.Timer | undefined = undefined;
	let activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) { triggerReplay(); }
    
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) { triggerReplay(); }
    }, null, context.subscriptions);
    
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) { triggerReplay(); }
    }, null, context.subscriptions);
    
	function triggerReplay() {
		if (timeout) {
            clearInterval(timeout);
			timeout = undefined;
        }
        //  Don't replay for generated Rust code.
        if (activeEditor && activeEditor.document.getText().indexOf('BEGIN BLOCKS') >= 0) { 
            console.log('Skipping replay for document with BEGIN BLOCKS');
            return; 
        }
		timeout = setInterval(() => {
            if (activeEditor) { replay(activeEditor); }
        }, 200);
	}
}

//  Remember the last span rendered
let lastStartRow: number = 0;
let lastStartCol: number = 0;
let lastEndRow: number = 0;
let lastEndCol: number = 0;

function replay(editor: vscode.TextEditor) {
    //  Replay one line of the log.
    if (!editor) { return; }
    //  If there are interpolated spans, replay them.
    if (interpolatedSpans.length > 0) {
        replayInterpolatedSpan(editor);
        return;
    }
    for (;;) {
        //  Look for replay lines starting with "#".
        if (replayLog.length === 0) { return; }
        const line = replayLog.shift();
        if (line === undefined || !line.startsWith('#')) { continue; }
        console.log('replay: ' + line);

        if (line.startsWith("#s")) {
            //  Replay Span: #s src/main.rs | 43 | 8 | 43 | 51
            //  Show the span as red.
            const replayed = replaySpan(editor, line, 0);
            if (!replayed) { continue; }  //  Not replayed because of duplicate, fetch next line.

        } else if (line.startsWith("#m")) {
            //  Replay Match: #m sensor::set_poll_rate_ms | src/main.rs | 43 | 8 | 43 | 51
            //  Mark the known declaration.
            const s = line.substr(2).split('|');
            declarations.markKnown(s[2].trim());
            //  Show the span as green.
            const span = s.slice(1).join('|');
            const replayed = replaySpan(editor, span, 1);

        } else if (line.startsWith("#i")) {
            //  Replay Infer: #i start_sensor_listener | sensor | sensor::set_poll_rate_ms | devname | &Strn
            //  Mark the pending and known declarations.
            const s = line.substr(2).split('|');
            const pendingPath = [s[0].trim(), s[1].trim()].join('|');
            const knownPath   = [s[2].trim(), s[3].trim()].join('|');
            const para = s[1].trim();
            const value = s[4].trim();
            const result = declarations.setPendingValue(
                pendingPath, 
                value
            );
            if (result) { vscode.window.showInformationMessage(`"${para}" was inferred as "${value}"`); }
            declarations.markPending(
                pendingPath
            );
            declarations.markKnown(
                knownPath
            );            
            //  Show the span as green.
            const span = [
                '',
                lastStartRow + 1,
                lastStartCol,
                lastEndRow + 1,
                lastEndCol
            ].join('|');
            const replayed = replaySpan(editor, span, 1);

        } else { continue; }
        break;
    }
}

function replaySpan(editor: vscode.TextEditor, line: string, color: number): boolean {
    //  Replay Span: #s src/main.rs | 43 | 8 | 43 | 51
    //  Return true if span has been replayed.
    if (!editor) { return false; }
    const s = line.split('|');
    const startRow = parseInt(s[1]) - 1;
    const startCol = parseInt(s[2]); 
    const endRow = parseInt(s[3]) - 1; 
    const endCol = parseInt(s[4]);
    //  If span is unchanged, fetch next line.
    if (startRow === lastStartRow
        && startCol === lastStartCol
        && endRow === lastEndRow
        && endCol === lastEndCol
        && spanColor === color) {
        return false;
    }
    //  Interpolate the span into 3 intermediate spans.
    interpolatedSpans = interpolateSpan(
        lastStartRow, startRow,
        lastStartCol, startCol,
        lastEndRow, endRow,
        lastEndCol, endCol
    );
    //  Remember the last span.
    lastStartRow = startRow;
    lastStartCol = startCol;
    lastEndRow = endRow;
    lastEndCol = endCol;
    spanColor = color;
    //  Decorate the span.
    //  Previously: decorate.decorate(editor, startRow, startCol, endRow, endCol);
    replayInterpolatedSpan(editor);
    return true;
}

function replayInterpolatedSpan(editor: vscode.TextEditor) {
    //  Replay the next interpolated span.
    if (!editor) { return; }
    if (interpolatedSpans.length === 0) { return; }
    const span = interpolatedSpans.shift();
    if (span === undefined) { return; }
    decorate.decorate(editor, spanColor, span[0], span[1], span[2], span[3]);
}

function interpolateSpan(
    startRow1: number, startRow2: number,
    startCol1: number, startCol2: number,
    endRow1: number, endRow2: number,
    endCol1: number, endCol2: number
) {
    //  Interpolate the span into 5 frames.
    const frames = 5;
    let result: number[][] = [];
    let incStartRow = (startRow2 - startRow1) / (frames * 1.0);
    let incStartCol = (startCol2 - startCol1) / (frames * 1.0);
    let incEndRow = (endRow2 - endRow1) / (frames * 1.0);
    let incEndCol = (endCol2 - endCol1) / (frames * 1.0);
    //  Interpolate (n - 1) frames.
    for (let i = 1; i < frames; i++) {
        result.push([
            startRow1 + Math.floor(i * incStartRow),
            startCol1 + Math.floor(i * incStartCol),
            endRow1 + Math.floor(i * incEndRow),
            endCol1 + Math.floor(i * incEndCol)
        ]);
    }
    //  Push the last frame.
    result.push([startRow2, startCol2, endRow2, endCol2]);
    return result;
}