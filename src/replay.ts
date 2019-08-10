//  Replay the recorded inference log
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as decorate from './decorate';

//  List of log entries to replay
let replayLog: string[] = [];

//  Current editor
let editor: vscode.TextEditor | undefined = undefined;

//  Current timeout
let timeout: NodeJS.Timer | undefined = undefined;

//  Called when VSCode is activated
export function activate(context: vscode.ExtensionContext) {
    editor = vscode.window.activeTextEditor;
    if (!editor) { return; }

    //  Read the entire replay file and break into lines.
    const replayPath = path.join(__filename, '..', '..', 'resources', 'replay.log');
    const buf = fs.readFileSync(replayPath);
    const log = buf.toString();
    replayLog = log.split('\n');

    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    timeout = setTimeout(() => replay(), 10 * 1000);
}

function replay() {
    //  Replay one line of the log.
    if (!editor) { return; }
    for (;;) {
        //  Look for lines starting with "#".
        if (replayLog.length === 0) { return; }
        const line = replayLog.shift();
        if (!line) { return; }
        if (!line.startsWith('#')) { continue; }

        if (line.startsWith("#s")) {
            //  #s src/main.rs | 43 | 8 | 43 | 51
            const s = line.split('|');
            decorate.decorate(
                editor,
                parseInt(s[1]) - 1,
                parseInt(s[2]) - 1,
                parseInt(s[3]) - 1,
                parseInt(s[4]) - 1,
            );
        } else if (line.startsWith("#m")) {
            //  #m sensor::set_poll_rate_ms | src/main.rs | 43 | 8 | 43 | 51

        } else if (line.startsWith("#i")) {
            //  #i start_sensor_listener | sensor | sensor::set_poll_rate_ms | devname | &Strn

        } else { continue; }
        break;
    }
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    timeout = setTimeout(() => replay(), 10 * 1000);
}