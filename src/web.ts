//  HTML content for the web view

export function getHtml(para: any) {
    //  Return the HTML content for the web view. Derived from media/blockly-mynewt-rust/demos/code/index.html, customised for VSCode
    //  TODO: Add security policy
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="google" value="notranslate">
    <title>Visual Embedded Rust</title>

    <!--  Load Blockly Stylesheet and our override  -->
    <link rel="stylesheet" href="${para.blocklyUri}/demos/code/style.css">
    <link rel="stylesheet" href="${para.vscodeUri}/style.css">
    
    <!--  Load Blockly and Google Closure  -->
    <script nonce="${para.nonce}" src="${para.blocklyUri}/blockly_uncompressed.js"></script>

    <!--  Need to load language explicitly for VSCode  -->
    <script nonce="${para.nonce}" src="${para.blocklyUri}/msg/js/en.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/demos/code/msg/en.js"></script>

    <!--  VSCode Integration for Modal Prompts, Storage and Messaging  -->
    <script nonce="${para.nonce}" src="${para.vscodeUri}/modal.js"></script>
    <script nonce="${para.nonce}" src="${para.vscodeUri}/storage.js"></script>
    <script nonce="${para.nonce}" src="${para.vscodeUri}/message.js"></script>

    <!--  Capture the vscode object for messaging the VSCode Extension and pass to modal and storage functions.  -->
    <script nonce="${para.nonce}">
        //  Must not leak vscode object to global space to prevent security issues.
        (function() {
            const vscode = acquireVsCodeApi();
            initModal(vscode);
            initStorage(vscode);
            //  vscode.postMessage({ command: 'alert', text: 'vscode captured' });
        }())
    </script>

    <!--  Load Blocks  -->
    <script nonce="${para.nonce}" src="${para.blocklyUri}/blocks_compressed.js"></script>

    <!--  Load Code Generators  -->
    <script nonce="${para.nonce}" src="${para.blocklyUri}/javascript_compressed.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/python_compressed.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/php_compressed.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/lua_compressed.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/dart_compressed.js"></script>

    <!--  Load Rust Code Generator  -->
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust.js"></script>

    <!--  Load Mynewt Blocks  -->
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/mynewt_blocks.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/mynewt_coap.js"></script>

    <!--  Load Mynewt Block Code Generators  -->
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/mynewt_functions.js"></script>

    <!--  Load Rust Functions. TODO: Package into rust_compressed.js  -->
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/colour.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/lists.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/logic.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/loops.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/math.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/procedures.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/text.js"></script>
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/variables.js"></script>  
    <script nonce="${para.nonce}" src="${para.blocklyUri}/generators/rust/variables_dynamic.js"></script>

    <!--  Load Main Program  -->
    <script nonce="${para.nonce}" src="${para.blocklyUri}/demos/code/code.js"></script>

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

    <!--  Begin: CoAP Category -->
    <category name="CoAP" colour="160">
        <block type="coap"></block>
        <block type="field"></block>
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
}

/* TODO: Set content security policy
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