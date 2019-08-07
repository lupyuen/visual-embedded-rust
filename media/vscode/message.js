/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Handle command messages from VSCode
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

//  Markers for wrapping the XML blocks
var blocks_begin = '-- BEGIN BLOCKS --';
var blocks_end   = '-- END BLOCKS --';

// Handle the message received from VSCode
window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    console.log(['recv msg', JSON.stringify(message).substr(0, 20)]);
    switch (message.command) {
        //  Load the blocks into the workspace.
        case 'loadDoc':
            //  Text contains `... /* -- BEGIN BLOCKS -- ... -- END BLOCKS -- */`. Extract the blocks.            
            const text = message.text;
            console.log(['loadDoc', text.substr(0, 20)]);

            const beginSplit = text.split(blocks_begin, 2);
            if (beginSplit.length < 2) { console.log(blocks_begin + ' not found'); return; }
            const endSplit = beginSplit[1].split(blocks_end, 2);
            if (endSplit.length < 2) { console.log(blocks_end + ' not found'); return; }
            const blocks = endSplit[0];

            //  Set the blocks in the workspace.
            var workspace = Blockly.getMainWorkspace();  if (!workspace) { console.log('Missing workspace'); return; }
            var xml = Blockly.Xml.textToDom(blocks);
            Blockly.Xml.domToWorkspace(xml, workspace);

            //  Monitor changes and sync updates to the VSCode document.
            BlocklyStorage.monitorChanges_(workspace);            
            return;
    }
});

function composeDoc(xml, code) {
    //  Given the XML blocks and the generated Rust code, compose the document to be updated in VSCode.
    const doc = [
        code,
        '/*  ' + blocks_begin,
        blocks_end + '  */',
    ].join('\n');
    return doc;
}