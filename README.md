# visual-embedded-rust: Visual Studio Extension for Visual Embedded Rust

Watch the demo: https://youtu.be/jYo8B8c7T3Y

Read the articles:

1. [_"Rust Rocks NB-IoT! STM32 Blue Pill with Quectel BC95-G on Apache Mynewt"_](https://medium.com/@ly.lee/rust-rocks-nb-iot-stm32-blue-pill-with-quectel-bc95-g-on-apache-mynewt-ef62a7e28f7e)

1. [_"Visual Programming with Embedded Rust? Yes we can with Apache Mynewt and Google Blockly!"_](https://medium.com/@ly.lee/visual-programming-with-embedded-rust-yes-we-can-with-apache-mynewt-and-google-blockly-8b67ef7412d7)

## Features

1. In the Visual Studio Code Explorer, create a new Rust source file like `main.rs`

1. Edit the Rust file

1. Click `Visual editor` at the top right of the editor

1. When prompted to populate the visual program, click `OK`

\!\[Visual Embedded Rust editor with generated Rust code\]\(images/editor.png\)

## Inside The Extension

The source code is located at `https://github.com/lupyuen/visual-embedded-rust`

1. Main logic for the VSCode Extension is in [`extension.ts`](src/extension.ts)

1. The extension creates a [WebView that embeds the HTML code](src/extension.ts#L250-L732) from Google Blockly. [HTML code is here](src/web.ts)

1. [When the WebView loads](media/vscode/storage.js#L58-L69), it fetches the [Blockly XML embedded](src/extension.ts#L141-L163) in the Rust document in VSCode and [refreshes the Blockly workspace](media/vscode/message.js#L36-L55)

1. When the [Blockly workspace is updated](media/vscode/storage.js#L165-L194), it sends the [updated Blockly XML and the generated Rust code](media/vscode/message.js#L59-L68) to the VSCode Extension.  The extension [updates the Rust document](src/extension.ts#L165-L184) in VSCode.

1. The Rust code generator for Blockly is here: [blockly-mynewt-rust](https://github.com/lupyuen/blockly-mynewt-rust/tree/master/generators/rust)

1. [Demo Rust source file is here](https://github.com/lupyuen/stm32bluepill-mynewt-sensor/blob/rust-nbiot/rust/visual/src/lib.rs)

## Building The Extension

To build the extension, two repositories need to be cloned into the `media` folder: [blockly-mynewt-rust](https://github.com/lupyuen/blockly-mynewt-rust) and [closure-library](https://github.com/google/closure-library):

```bash
cd media
git clone https://github.com/lupyuen/blockly-mynewt-rust
git clone https://github.com/google/closure-library
```