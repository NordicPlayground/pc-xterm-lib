"use strict";
/* Copyright (c) 2020 - 2021, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _terminal, _prompt, _config, _historyAddon, _addons, _lineSpan, _lineCount, _userInput_1, _cursorInputIndex_1, _registeredCommands, _userInputChangeListeners, _runCommandListeners, _keyListener, _dataListener;
Object.defineProperty(exports, "__esModule", { value: true });
const ansi = __importStar(require("ansi-escapes"));
const Prompt_1 = __importDefault(require("./Prompt"));
const HistoryAddon_1 = __importDefault(require("./addons/HistoryAddon"));
const TimestampAddon_1 = __importDefault(require("./addons/TimestampAddon"));
const CopyPasteAddon_1 = __importDefault(require("./addons/CopyPasteAddon"));
const AutocompleteAddon_1 = __importDefault(require("./addons/AutocompleteAddon"));
const utils_1 = require("./utils");
const HoverAddon_1 = __importDefault(require("./addons/HoverAddon"));
const defaultTerminalMode = { type: 'line' };
/**
 * Contains logic and control code for the most common terminal tasks,
 * like typing, moving the caret, and running commands.
 *
 * Some of this logic is exposed as public methods, allowing addons
 * to make use of it.
 *
 * Those same addons are loaded as part of this addon's activation
 * process, so this class can be thought of as the "root" of the
 * addon tree.
 */
class NrfTerminalCommander {
    constructor(config) {
        _terminal.set(this, void 0);
        _prompt.set(this, void 0);
        _config.set(this, void 0);
        _historyAddon.set(this, void 0);
        _addons.set(this, []);
        _lineSpan.set(this, 0);
        _lineCount.set(this, 1);
        _userInput_1.set(this, '');
        _cursorInputIndex_1.set(this, 0);
        _registeredCommands.set(this, {});
        _userInputChangeListeners.set(this, []);
        _runCommandListeners.set(this, []);
        _keyListener.set(this, void 0);
        _dataListener.set(this, void 0);
        __classPrivateFieldSet(this, _config, config);
        __classPrivateFieldSet(this, _prompt, new Prompt_1.default(this, config.prompt || ''));
        __classPrivateFieldSet(this, _keyListener, null);
        __classPrivateFieldSet(this, _dataListener, null);
    }
    activate(terminal) {
        var _a;
        __classPrivateFieldSet(this, _terminal, terminal);
        const historyAddon = new HistoryAddon_1.default(this);
        __classPrivateFieldSet(this, _historyAddon, historyAddon);
        __classPrivateFieldGet(this, _terminal).loadAddon(historyAddon);
        __classPrivateFieldGet(this, _addons).push(historyAddon);
        if (__classPrivateFieldGet(this, _config).showTimestamps) {
            const timestampAddon = new TimestampAddon_1.default(this);
            __classPrivateFieldGet(this, _terminal).loadAddon(timestampAddon);
            __classPrivateFieldGet(this, _addons).push(timestampAddon);
            this.registerCommand('toggle_timestamps', () => {
                timestampAddon.toggleTimestamps();
            });
        }
        const copyPasteAddon = new CopyPasteAddon_1.default(this);
        __classPrivateFieldGet(this, _terminal).loadAddon(copyPasteAddon);
        __classPrivateFieldGet(this, _addons).push(copyPasteAddon);
        const autocompleteAddon = new AutocompleteAddon_1.default(this, __classPrivateFieldGet(this, _config).completerFunction);
        __classPrivateFieldGet(this, _terminal).loadAddon(autocompleteAddon);
        __classPrivateFieldGet(this, _addons).push(autocompleteAddon);
        this.autocompleteAddon = autocompleteAddon;
        const hoverAddon = new HoverAddon_1.default(this, []);
        __classPrivateFieldGet(this, _terminal).loadAddon(hoverAddon);
        __classPrivateFieldGet(this, _addons).push(hoverAddon);
        this.terminalMode = (_a = __classPrivateFieldGet(this, _config).terminalMode) !== null && _a !== void 0 ? _a : defaultTerminalMode;
        this.registerCommand('show_history', () => {
            console.log(historyAddon.history);
        });
        this.registerCommand('clear_history', () => {
            historyAddon.clearHistory();
        });
        this.registerCustomCommands();
    }
    dispose() {
        return false;
    }
    /**
     * The current user input.
     */
    get userInput() {
        return __classPrivateFieldGet(this, _userInput_1);
    }
    set _userInput(newUserInput) {
        __classPrivateFieldSet(this, _userInput_1, newUserInput);
        __classPrivateFieldGet(this, _userInputChangeListeners).forEach(l => l(this.userInput));
    }
    get cursorInputIndex() {
        return __classPrivateFieldGet(this, _cursorInputIndex_1);
    }
    set _cursorInputIndex(newCursorInputIndex) {
        __classPrivateFieldSet(this, _cursorInputIndex_1, newCursorInputIndex);
    }
    /**
     * The number of lines spanned by the current command.
     */
    get lineSpan() {
        return __classPrivateFieldGet(this, _lineSpan);
    }
    get lineCount() {
        return __classPrivateFieldGet(this, _lineCount);
    }
    get prompt() {
        return __classPrivateFieldGet(this, _prompt);
    }
    /**
     * Allows moving between 'line' and 'character' mode
     */
    set terminalMode(terminalMode) {
        if (__classPrivateFieldGet(this, _keyListener) !== null) {
            __classPrivateFieldGet(this, _keyListener).dispose();
            __classPrivateFieldSet(this, _keyListener, null);
        }
        if (__classPrivateFieldGet(this, _dataListener) !== null) {
            __classPrivateFieldGet(this, _dataListener).dispose();
            __classPrivateFieldSet(this, _dataListener, null);
        }
        if (terminalMode.type == 'character') {
            __classPrivateFieldGet(this, _addons).forEach(addon => addon.disconnect());
            // We don't need to set onKey to achieve character mode
            __classPrivateFieldSet(this, _dataListener, __classPrivateFieldGet(this, _terminal).onData(terminalMode.onData));
        }
        else {
            __classPrivateFieldGet(this, _addons).forEach(addon => addon.connect());
            __classPrivateFieldSet(this, _keyListener, __classPrivateFieldGet(this, _terminal).onKey(this.onKey.bind(this)));
            __classPrivateFieldSet(this, _dataListener, __classPrivateFieldGet(this, _terminal).onData(this.onData.bind(this)));
        }
    }
    /**
     * Registers the given `command` in the terminal, such that when it is
     * executed `callback` is run.
     * @param command The command to listen for.
     * @param callback The function to run when the command is given.
     */
    registerCommand(command, callback) {
        __classPrivateFieldGet(this, _registeredCommands)[command] = callback;
    }
    /**
     * Registers all custom commands from the provided config
     */
    registerCustomCommands() {
        for (const [command, callback] of Object.entries(__classPrivateFieldGet(this, _config).commands)) {
            this.registerCommand(command, callback);
        }
    }
    /**
     * Registers a function that will be called whenever the user input changes,
     * with the new user input.
     * @param listener The function to call when the user input changes.
     * @returns a function to unregister the listener
     */
    onUserInputChange(listener) {
        __classPrivateFieldGet(this, _userInputChangeListeners).push(listener);
        return () => (__classPrivateFieldSet(this, _userInputChangeListeners, __classPrivateFieldGet(this, _userInputChangeListeners).filter(l => l !== listener)));
    }
    /**
     * Registers a function that will be called whenever the a command is run,
     * with the command value.
     * @param listener The function to call when a command is run.
     * @returns a function to unregister the listener
     */
    onRunCommand(listener) {
        __classPrivateFieldGet(this, _runCommandListeners).push(listener);
        return () => (__classPrivateFieldSet(this, _runCommandListeners, __classPrivateFieldGet(this, _runCommandListeners).filter(l => l !== listener)));
    }
    /**
     * Replaces the user input currently being entered into the buffer.
     * @param newUserInput The user input written to the screen. Defaults to an empty string.
     */
    replaceUserInput(newUserInput = '') {
        this.clearUserInput();
        __classPrivateFieldGet(this, _terminal).write(newUserInput);
        this._cursorInputIndex = newUserInput.length;
        this._userInput = newUserInput;
    }
    /**
     * Returns `true` if the cursor is placed at the beginning of
     * the line (i.e. right after the prompt), otherwise `false`.
     */
    atBeginningOfLine() {
        const buffer = __classPrivateFieldGet(this, _terminal).buffer.active;
        return buffer.cursorX <= __classPrivateFieldGet(this, _prompt).length - 2;
    }
    /**
     * Returns `true` if the cursor is placed at the end of
     * the line (i.e. one character after the final one typed),
     * otherwise `false`.
     */
    atEndOfLine() {
        const maxRightCursor = __classPrivateFieldGet(this, _prompt).length - 2 + this.userInput.length;
        const buffer = __classPrivateFieldGet(this, _terminal).buffer.active;
        return buffer.cursorX >= maxRightCursor;
    }
    /**
     * Removes all the typed characters on the current line, and
     * moves the cursor to the beginning.
     */
    clearUserInput() {
        __classPrivateFieldGet(this, _terminal).write(ansi.cursorTo(__classPrivateFieldGet(this, _prompt).length - 2));
        __classPrivateFieldGet(this, _terminal).write(ansi.eraseEndLine);
        this._cursorInputIndex = 0;
    }
    backspace() {
        if (!this.atBeginningOfLine()) {
            if (this.atEndOfLine()) {
                __classPrivateFieldGet(this, _terminal).write('\b \b');
                this._cursorInputIndex = this.cursorInputIndex - 1;
                this._userInput = this.userInput.slice(0, this.userInput.length - 1);
            }
            else {
                const newUserInput = this.userInput.substring(0, this.cursorInputIndex - 1) +
                    this.userInput.substring(this.cursorInputIndex);
                const oldCursorInputIndex = this.cursorInputIndex;
                this.replaceUserInput(newUserInput);
                this._cursorInputIndex = oldCursorInputIndex - 1;
                this.setCursorToIndex(this.cursorInputIndex);
            }
        }
    }
    moveCaretLeft() {
        if (!this.atBeginningOfLine()) {
            this._cursorInputIndex = this.cursorInputIndex - 1;
            this.setCursorToIndex(this.cursorInputIndex);
        }
    }
    moveCaretRight() {
        if (!this.atEndOfLine()) {
            this._cursorInputIndex = this.cursorInputIndex + 1;
            this.setCursorToIndex(this.cursorInputIndex);
        }
    }
    runCommand(cmd) {
        const command = cmd || this.userInput.trim();
        if (command.length) {
            const callback = __classPrivateFieldGet(this, _registeredCommands)[command];
            if (callback) {
                callback();
            }
            else if (__classPrivateFieldGet(this, _config).unspecifiedCommandHandler) {
                __classPrivateFieldGet(this, _config).unspecifiedCommandHandler(command);
            }
            __classPrivateFieldGet(this, _runCommandListeners).forEach(l => l(command));
        }
        this.breakCurrentCommand();
    }
    /**
     * Prints a new prompt and removes the currently entered
     * text. Useful whenever a new line of input needs to be
     * started, i.e. because a command was just run.
     */
    breakCurrentCommand() {
        __classPrivateFieldSet(this, _lineCount, __classPrivateFieldGet(this, _lineCount) + 1);
        __classPrivateFieldGet(this, _terminal).write(__classPrivateFieldGet(this, _prompt).value);
        __classPrivateFieldGet(this, _historyAddon).resetCursor();
        this._userInput = '';
        this._cursorInputIndex = 0;
    }
    onData(data) {
        switch (utils_1.charCode(data)) {
            case utils_1.CharCodes.CTRL_C:
            case utils_1.CharCodes.ARROW_KEY:
                return;
            case utils_1.CharCodes.BACKSPACE:
                return this.backspace();
            case utils_1.CharCodes.LF:
                if (!this.autocompleteAddon.isVisible) {
                    return this.runCommand();
                }
        }
        this.updateUserInput(data);
        this.updateLineSpan();
        this.autocompleteAddon.enable();
    }
    onKey(e) {
        switch (e.domEvent.code) {
            case 'ArrowLeft': {
                return this.moveCaretLeft();
            }
            case 'ArrowRight': {
                return this.moveCaretRight();
            }
            case 'KeyC': {
                if (!e.domEvent.ctrlKey)
                    break;
                // On Windows and Linux, pressing Ctrl-C when text is selected
                // should copy that text rather than breaking the line.
                if (!utils_1.isMac() && __classPrivateFieldGet(this, _terminal).getSelection().length)
                    break;
                this.breakCurrentCommand();
                break;
            }
        }
    }
    updateLineSpan() {
        const delta = __classPrivateFieldGet(this, _terminal).cols - __classPrivateFieldGet(this, _prompt).length;
        __classPrivateFieldSet(this, _lineSpan, Math.floor(this.userInput.length / delta));
    }
    setCursorToIndex(index) {
        __classPrivateFieldGet(this, _terminal).write(ansi.cursorTo(__classPrivateFieldGet(this, _prompt).length - 2 + index));
    }
    updateUserInput(data) {
        const newUserInput = this.userInput.substring(0, this.cursorInputIndex) +
            data +
            this.userInput.substring(this.cursorInputIndex);
        const oldCursorInputIndex = this.cursorInputIndex;
        this.replaceUserInput(newUserInput);
        this._cursorInputIndex = oldCursorInputIndex + data.length;
        this.setCursorToIndex(this.cursorInputIndex);
    }
}
exports.default = NrfTerminalCommander;
_terminal = new WeakMap(), _prompt = new WeakMap(), _config = new WeakMap(), _historyAddon = new WeakMap(), _addons = new WeakMap(), _lineSpan = new WeakMap(), _lineCount = new WeakMap(), _userInput_1 = new WeakMap(), _cursorInputIndex_1 = new WeakMap(), _registeredCommands = new WeakMap(), _userInputChangeListeners = new WeakMap(), _runCommandListeners = new WeakMap(), _keyListener = new WeakMap(), _dataListener = new WeakMap();
