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

// Handle the message inside the webview
window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    console.log(['recv msg', JSON.stringify(message).substr(0, 10)]);
    switch (message.command) {
        //  Load the blocks into the workspace.
        case 'load':
            //  Text contains `... /* -- BEGIN BLOCKS -- ... -- END BLOCKS -- */`. Extract the blocks.            
            const text = message.text;
            console.log(['load', text.substr(0, 10)]);

            const beginSplit = text.split('-- BEGIN BLOCKS --', 2);
            if (beginSplit.length < 2) { console.log('"-- BEGIN BLOCKS --" not found'); return; }
            const endSplit = beginSplit[1].split('-- END BLOCKS --', 2);
            if (endSplit.length < 2) { console.log('"-- END BLOCKS --" not found'); return; }
            const blocks = endSplit[0];

            //  Set the blocks in the workspace.
            var workspace = Blockly.getMainWorkspace();  if (!workspace) { console.log('Missing workspace'); return; }
            var xml = Blockly.Xml.textToDom(blocks);
            Blockly.Xml.domToWorkspace(xml, workspace);
            return;
    }
});
