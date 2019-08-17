# visual-embedded-rust

- Create and edit Embedded Rust programs visually by dragging and dropping blocks

- Generates Embedded Rust code for [STM32 Blue Pill](https://medium.com/swlh/super-blue-pill-like-stm32-blue-pill-but-better-6d341d9347da?source=friends_link&sk=956087171b9b9efcc484ea60b9c78c16) with [Apache Mynewt](https://mynewt.apache.org/) realtime operating system

## Features

Watch the demo: https://youtu.be/ytGa-7q6sqY

Read the articles...

1. [_"Visual Embedded Rust Programming with Visual Studio Code"_](https://medium.com/@ly.lee/visual-embedded-rust-programming-with-visual-studio-code-1bc1262e398c?source=friends_link&sk=222de63e45993aacd0db5a2e4b1f33c7)

1. [_"Advanced Topics for Visual Embedded Rust Programming"_](https://medium.com/@ly.lee/advanced-topics-for-visual-embedded-rust-programming-ebf1627fe397?source=friends_link&sk=01f0ae0e1b82efa9fd6b8e5616c736af)

1. [_"Rust Rocks NB-IoT! STM32 Blue Pill with Quectel BC95-G on Apache Mynewt"_](https://medium.com/@ly.lee/rust-rocks-nb-iot-stm32-blue-pill-with-quectel-bc95-g-on-apache-mynewt-ef62a7e28f7e?source=friends_link&sk=aaa21371f68a07c543066b6b89a760f0)

1. [_"Visual Programming with Embedded Rust? Yes we can with Apache Mynewt and Google Blockly!"_](https://medium.com/@ly.lee/visual-programming-with-embedded-rust-yes-we-can-with-apache-mynewt-and-google-blockly-8b67ef7412d7?source=friends_link&sk=353fb92b6f20ebf885ff5c9be44fd6f2)

![Visual Embedded Rust](images/animation.gif)

## Usage

1. In the Visual Studio Code Explorer, create a new empty Rust source file like `lib.rs`

1. Edit the Rust file

1. Click `Visual Editor` at the top right of the editor

1. When prompted to populate the visual program into the Rust source file, click `OK`

1. Click the Rust source file to see the generated Rust code. Save the file to save the visual program. Don't edit the Rust source file manually, always use the visual editor.

[Sample Rust source file containing generated Rust code and XML blocks](https://github.com/lupyuen/stm32bluepill-mynewt-sensor/blob/rust-nbiot/rust/visual/src/lib.rs)

![Visual Embedded Rust editor with generated Rust code](images/editor.png)

## Build

To build the generated Rust program...

1. Follow the [instructions here to install Embedded Rust and Apache Mynewt](https://medium.com/@ly.lee/install-embedded-rust-and-apache-mynewt-for-visual-studio-code-on-windows-533ac87b35ad)

1. Copy the Rust source file containing the generated code to `rust/app/src/lib.rs`. Overwrite the existing file.

1. Delete the files `app_network.rs` and `app_sensor.rs` in that folder

1. Rebuild by clicking `Terminal → Run Task → [2] Build bluepill_my_sensor`

## Generated Code

To making coding easier for beginners, the extension generates Typeless Rust code like this...

```rust
#[infer_type]  //  Infer the missing types
fn start_sensor_listener(sensor_name: _, sensor_key: _, sensor_type: _, poll_time: _) ...
    //  Call Mynewt API
    sensor::set_poll_rate_ms(sensor_name, poll_time) ? ;
```

When the typeless code is compiled, the [`infer_type` Procedural Macro](https://github.com/lupyuen/stm32bluepill-mynewt-sensor/blob/rust-nbiot/rust/macros/src/infer_type.rs) infers the types by matching the variables against the Mynewt API...

```rust
//  Call Mynewt API
sensor::set_poll_rate_ms(sensor_name, poll_time) ? ;  
//  `sensor_name` inferred as type `&Strn`
//  `poll_time`   inferred as type `u32`
```

The macro then injects the inferred types into the typeless code...

```rust
fn start_sensor_listener(sensor_name: &Strn, sensor_key: &'static Strn,
                         sensor_type: sensor_type_t, poll_time: u32) ...
```

The inferred types are stored in `infer.json`. The enables the types inferred in one function to be inferred for other functions...

```json
    "start_sensor_listener": [
        [ "sensor_name", "&Strn" ],
        [ "sensor_key",  "&'static Strn" ],
        [ "sensor_type", "sensor_type_t" ],
        [ "poll_time",   "u32" ]
    ],
    "send_sensor_data": [
        [ "sensor_data", "&SensorValue" ]
    ],
    "handle_sensor_data": [
        [ "sensor_data", "&SensorValue" ]
    ]
```

More details in the article [_"Advanced Topics for Visual Embedded Rust Programming"_](https://medium.com/@ly.lee/advanced-topics-for-visual-embedded-rust-programming-ebf1627fe397?source=friends_link&sk=01f0ae0e1b82efa9fd6b8e5616c736af)

![Inferring the missing types in the generated Rust code](images/typeless-rust.png)

## Inside The Extension

The source code is located at [`github.com/lupyuen/visual-embedded-rust`](https://github.com/lupyuen/visual-embedded-rust)

More details in the article [_"Advanced Topics for Visual Embedded Rust Programming"_](https://medium.com/@ly.lee/advanced-topics-for-visual-embedded-rust-programming-ebf1627fe397?source=friends_link&sk=01f0ae0e1b82efa9fd6b8e5616c736af)

## Release Notes

For changelog refer to...

1.  [`github.com/lupyuen/visual-embedded-rust/commits/master`](https://github.com/lupyuen/visual-embedded-rust/commits/master)

1.  [`github.com/lupyuen/blockly-mynewt-rust/commits/master`](https://github.com/lupyuen/blockly-mynewt-rust/commits/master)

1.  [`github.com/lupyuen/stm32bluepill-mynewt-sensor/commits/rust-nbiot`](https://github.com/lupyuen/stm32bluepill-mynewt-sensor/commits/rust-nbiot)
