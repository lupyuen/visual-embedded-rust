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
 * @fileoverview Handle incoming messages from VSCode
 * @author luppy@appkaki.com (Lee Lup Yuen)
 */
'use strict';

// Handle the message inside the webview
window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    console.log(['recv msg', JSON.stringify(message)]);
    switch (message.command) {
        case 'load':
            const blocks = message.blocks;
            console.log(['load', blocks]);
            return;

            /* TODO
            if ('localStorage' in window && window.localStorage[url]) {
                var workspace = opt_workspace || Blockly.getMainWorkspace();
                var xml = Blockly.Xml.textToDom(window.localStorage[url]);
                Blockly.Xml.domToWorkspace(xml, workspace);
            }
            */

    }
});
