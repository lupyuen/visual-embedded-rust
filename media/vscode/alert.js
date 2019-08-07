/**
 * Override this because VSCode doesn't support alert().
 * Wrapper to window.alert() that app developers may override to
 * provide alternatives to the modal browser window.
 * @param {string} message The message to display to the user.
 * @param {function()=} opt_callback The callback when the alert is dismissed.
 */
Blockly.alert = function(message, opt_callback) {
    // window.alert(message);
    console.error(message);
    if (opt_callback) {
        opt_callback();
    }
};