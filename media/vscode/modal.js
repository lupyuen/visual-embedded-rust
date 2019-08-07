//  Override the Blockly modal functions for alert(), confirm() and prompt() because they are not supported in VSCode

/**
 * Override this because VSCode doesn't support alert().
 * Wrapper to window.alert() that app developers may override to
 * provide alternatives to the modal browser window.
 * @param {string} message The message to display to the user.
 * @param {function()=} opt_callback The callback when the alert is dismissed.
 */
Blockly.alert = function(message, opt_callback) {
    //  Previously: window.alert(message);
    console.error(message);
    if (opt_callback) {
        opt_callback();
    }
};

/**
 * Override this because VSCode doesn't support confirm().
 * Wrapper to window.confirm() that app developers may override to
 * provide alternatives to the modal browser window.
 * @param {string} message The message to display to the user.
 * @param {!function(boolean)} callback The callback for handling user response.
 */
Blockly.confirm = function(message, callback) {
    //  Pass to callback a boolean indicating whether OK (true) or Cancel (false) was selected
    //  Previously: callback(window.confirm(message));
    console.log(['confirm', message]);
    //  Set the callback.
    confirmResult = result => {
        confirmResult = null;
        callback(result);
    };
    //  Call VSCode to prompt.
    vscode.postMessage({
        command: 'confirm',
        message: message
    });
};
  
/**
 * Override this because VSCode doesn't support prompt().
 * Wrapper to window.prompt() that app developers may override to provide
 * alternatives to the modal browser window. Built-in browser prompts are
 * often used for better text input experience on mobile device. We strongly
 * recommend testing mobile when overriding this.
 * @param {string} message The message to display to the user.
 * @param {string} defaultValue The value to initialize the prompt with.
 * @param {!function(string)} callback The callback for handling user response.
 */
Blockly.prompt = function(message, defaultValue, callback) {
    //  Previously: callback(window.prompt(message, defaultValue));
    console.log(['prompt', message, defaultValue]);
    //  Set the callback.
    promptResult = result => {
        promptResult = null;
        callback(result);
    };
    //  Call VSCode to prompt.
    vscode.postMessage({
        command: 'prompt',
        message: message,
        defaultValue: defaultValue,
    });
};