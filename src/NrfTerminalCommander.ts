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

import { Terminal, ITerminalAddon, IDisposable } from 'xterm';
import * as ansi from 'ansi-escapes';

import Prompt from './Prompt';
import NrfTerminalAddon from './NrfTerminalAddon';
import HistoryAddon from './addons/HistoryAddon';
import TimestampAddon from './addons/TimestampAddon';
import CopyPasteAddon from './addons/CopyPasteAddon';
import AutocompleteAddon, {
    CompleterFunction,
} from './addons/AutocompleteAddon';

import { charCode, CharCodes, isMac } from './utils';
import HoverAddon, { HoverMetadata } from './addons/HoverAddon';

export interface KeyEvent {
    key: string;
    domEvent: KeyboardEvent;
}

export type UserInputChangeListener = (userInput: string) => void;
export type RunCommandListener = (command: string) => void;
export type TerminalMode =
    | { type: 'character'; onData: (data: string) => void }
    | { type: 'line' };

const defaultTerminalMode: TerminalMode = { type: 'line' };

export interface NrfTerminalConfig {
    /**
     * The string to be displayed at the start of each new line.
     */
    prompt?: string;
    /**
     * A function that, given the current user input, returns the list
     * of autocompletion entries that should be displayed.
     *
     * @example
     * function completer(userInput: string) {
     *   const completions: Completion[] = [
     *      {
     *        value: "toggle_autcomplete",
     *        description: "Toggles autocompletion on and off."
     *      }
     *   ];
     *
     *   return completions.filter(c => c.value.beginsWith(userInput));
     * }
     */
    completerFunction: CompleterFunction;
    /**
     * An object where every key is a command, and where typing that
     * command into the terminal will run the associated function.
     *
     * @example
     * const commands = {
     *   toggle_autocomplete: () => console.log("Toggling autocomplete"),
     *   print_date: () => console.log(new Date())
     * }
     */
    commands: { [name: string]: () => void };
    /**
     * A function that handles all user input not specified in `commands`.
     * Can be omitted if no such handling is desired.
     *
     * @example
     * unspecifiedCommandHandler(userInput: string): void {
     *   console.log(`Unrecognized command: ${userInput}`)
     * }
     */
    unspecifiedCommandHandler?: (userInput: string) => void;
    hoverMetadata: HoverMetadata[];
    /**
     * Whether or not timestamps should be displayed after each command
     * is run.
     */
    showTimestamps: boolean;

    /**
     * Whether to use 'line' mode where we provide a line editing and command interface over the regular xterm behaviour
     * or leave it in 'character' mode where the onData and onKey are connected up directly by the user.
     */
    terminalMode?: TerminalMode;
}

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
export default class NrfTerminalCommander implements ITerminalAddon {
    #terminal!: Terminal;
    #prompt: Prompt;
    #config: NrfTerminalConfig;
    #historyAddon!: HistoryAddon;
    autocompleteAddon!: AutocompleteAddon;

    #addons: NrfTerminalAddon[] = [];

    #lineSpan = 0;
    #lineCount = 1;
    #userInput = '';
    #cursorInputIndex = 0;

    #registeredCommands: { [command: string]: () => void } = {};
    #userInputChangeListeners: UserInputChangeListener[] = [];
    #runCommandListeners: RunCommandListener[] = [];

    #keyListener: IDisposable | null;
    #dataListener: IDisposable | null;

    constructor(config: NrfTerminalConfig) {
        this.#config = config;
        this.#prompt = new Prompt(this, config.prompt || '');

        this.#keyListener = null;
        this.#dataListener = null;
    }

    public activate(terminal: Terminal) {
        this.#terminal = terminal;

        const historyAddon = new HistoryAddon(this);
        this.#historyAddon = historyAddon;
        this.#terminal.loadAddon(historyAddon);
        this.#addons.push(historyAddon);

        if (this.#config.showTimestamps) {
            const timestampAddon = new TimestampAddon(this);
            this.#terminal.loadAddon(timestampAddon);
            this.#addons.push(timestampAddon);
            this.registerCommand('toggle_timestamps', () => {
                timestampAddon.toggleTimestamps();
            });
        }

        const copyPasteAddon = new CopyPasteAddon(this);
        this.#terminal.loadAddon(copyPasteAddon);
        this.#addons.push(copyPasteAddon);

        const autocompleteAddon = new AutocompleteAddon(
            this,
            this.#config.completerFunction
        );
        this.#terminal.loadAddon(autocompleteAddon);
        this.#addons.push(autocompleteAddon);
        this.autocompleteAddon = autocompleteAddon;

        const hoverAddon = new HoverAddon(this, []);
        this.#terminal.loadAddon(hoverAddon);
        this.#addons.push(hoverAddon);

        this.terminalMode = this.#config.terminalMode ?? defaultTerminalMode;

        this.registerCommand('show_history', () => {
            console.log(historyAddon.history);
        });

        this.registerCommand('clear_history', () => {
            historyAddon.clearHistory();
        });

        this.registerCustomCommands();
    }

    public dispose() {
        return false;
    }

    /**
     * The current user input.
     */
    public get userInput() {
        return this.#userInput;
    }

    private set _userInput(newUserInput: string) {
        this.#userInput = newUserInput;
        this.#userInputChangeListeners.forEach(l => l(this.userInput));
    }

    public get cursorInputIndex() {
        return this.#cursorInputIndex;
    }

    private set _cursorInputIndex(newCursorInputIndex: number) {
        this.#cursorInputIndex = newCursorInputIndex;
    }

    /**
     * The number of lines spanned by the current command.
     */
    public get lineSpan() {
        return this.#lineSpan;
    }

    public get lineCount() {
        return this.#lineCount;
    }

    public get prompt() {
        return this.#prompt;
    }

    /**
     * Allows moving between 'line' and 'character' mode
     */
    public set terminalMode(terminalMode: TerminalMode) {
        if (this.#keyListener !== null) {
            this.#keyListener.dispose();
            this.#keyListener = null;
        }

        if (this.#dataListener !== null) {
            this.#dataListener.dispose();
            this.#dataListener = null;
        }

        if (terminalMode.type == 'character') {
            this.#addons.forEach(addon => addon.disconnect());
            // We don't need to set onKey to achieve character mode
            this.#dataListener = this.#terminal.onData(terminalMode.onData);
        } else {
            this.#addons.forEach(addon => addon.connect());
            this.#keyListener = this.#terminal.onKey(this.onKey.bind(this));
            this.#dataListener = this.#terminal.onData(this.onData.bind(this));
        }
    }

    /**
     * Registers the given `command` in the terminal, such that when it is
     * executed `callback` is run.
     * @param command The command to listen for.
     * @param callback The function to run when the command is given.
     */
    private registerCommand(command: string, callback: () => void): void {
        this.#registeredCommands[command] = callback;
    }

    /**
     * Registers all custom commands from the provided config
     */
    private registerCustomCommands(): void {
        for (const [command, callback] of Object.entries(
            this.#config.commands
        )) {
            this.registerCommand(command, callback);
        }
    }

    /**
     * Registers a function that will be called whenever the user input changes,
     * with the new user input.
     * @param listener The function to call when the user input changes.
     * @returns a function to unregister the listener
     */
    public onUserInputChange(listener: UserInputChangeListener): () => void {
        this.#userInputChangeListeners.push(listener);

        return () =>
            (this.#userInputChangeListeners = this.#userInputChangeListeners.filter(
                l => l !== listener
            ));
    }

    /**
     * Registers a function that will be called whenever the a command is run,
     * with the command value.
     * @param listener The function to call when a command is run.
     * @returns a function to unregister the listener
     */
    public onRunCommand(listener: RunCommandListener): () => void {
        this.#runCommandListeners.push(listener);

        return () =>
            (this.#runCommandListeners = this.#runCommandListeners.filter(
                l => l !== listener
            ));
    }

    /**
     * Replaces the user input currently being entered into the buffer.
     * @param newUserInput The user input written to the screen. Defaults to an empty string.
     */
    public replaceUserInput(newUserInput: string = ''): void {
        this.clearUserInput();
        this.#terminal.write(newUserInput);
        this._cursorInputIndex = newUserInput.length;
        this._userInput = newUserInput;
    }

    /**
     * Returns `true` if the cursor is placed at the beginning of
     * the line (i.e. right after the prompt), otherwise `false`.
     */
    public atBeginningOfLine(): boolean {
        const buffer = this.#terminal.buffer.active;
        return buffer.cursorX <= this.#prompt.length - 2;
    }

    /**
     * Returns `true` if the cursor is placed at the end of
     * the line (i.e. one character after the final one typed),
     * otherwise `false`.
     */
    public atEndOfLine(): boolean {
        const maxRightCursor = this.#prompt.length - 2 + this.userInput.length;
        const buffer = this.#terminal.buffer.active;
        return buffer.cursorX >= maxRightCursor;
    }

    /**
     * Removes all the typed characters on the current line, and
     * moves the cursor to the beginning.
     */
    public clearUserInput(): void {
        this.#terminal.write(ansi.cursorTo(this.#prompt.length - 2));
        this.#terminal.write(ansi.eraseEndLine);
        this._cursorInputIndex = 0;
    }

    private backspace(): void {
        if (!this.atBeginningOfLine()) {
            if (this.atEndOfLine()) {
                this.#terminal.write('\b \b');
                this._cursorInputIndex = this.cursorInputIndex - 1;
                this._userInput = this.userInput.slice(
                    0,
                    this.userInput.length - 1
                );
            } else {
                const newUserInput =
                    this.userInput.substring(0, this.cursorInputIndex - 1) +
                    this.userInput.substring(this.cursorInputIndex);
                const oldCursorInputIndex = this.cursorInputIndex;
                this.replaceUserInput(newUserInput);
                this._cursorInputIndex = oldCursorInputIndex - 1;
                this.setCursorToIndex(this.cursorInputIndex);
            }
        }
    }

    private moveCaretLeft(): void {
        if (!this.atBeginningOfLine()) {
            this._cursorInputIndex = this.cursorInputIndex - 1;
            this.setCursorToIndex(this.cursorInputIndex);
        }
    }

    private moveCaretRight(): void {
        if (!this.atEndOfLine()) {
            this._cursorInputIndex = this.cursorInputIndex + 1;
            this.setCursorToIndex(this.cursorInputIndex);
        }
    }

    public runCommand(cmd?: string): void {
        const command = cmd || this.userInput.trim();
        if (command.length) {
            const callback = this.#registeredCommands[command];
            if (callback) {
                callback();
            } else if (this.#config.unspecifiedCommandHandler) {
                this.#config.unspecifiedCommandHandler(command);
            }
            this.#runCommandListeners.forEach(l => l(command));
        }
        this.breakCurrentCommand();
    }

    /**
     * Prints a new prompt and removes the currently entered
     * text. Useful whenever a new line of input needs to be
     * started, i.e. because a command was just run.
     */
    private breakCurrentCommand() {
        this.#lineCount += 1;
        this.#terminal.write(this.#prompt.value);
        this.#historyAddon.resetCursor();
        this._userInput = '';
        this._cursorInputIndex = 0;
    }

    private onData(data: string): void {
        switch (charCode(data)) {
            case CharCodes.CTRL_C:
            case CharCodes.ARROW_KEY:
                return;

            case CharCodes.BACKSPACE:
                return this.backspace();

            case CharCodes.LF:
                if (!this.autocompleteAddon.isVisible) {
                    return this.runCommand();
                }
        }

        this.updateUserInput(data);
        this.updateLineSpan();
        this.autocompleteAddon.enable();
    }

    private onKey(e: KeyEvent): void {
        switch (e.domEvent.code) {
            case 'ArrowLeft': {
                return this.moveCaretLeft();
            }

            case 'ArrowRight': {
                return this.moveCaretRight();
            }

            case 'KeyC': {
                if (!e.domEvent.ctrlKey) break;
                // On Windows and Linux, pressing Ctrl-C when text is selected
                // should copy that text rather than breaking the line.
                if (!isMac() && this.#terminal.getSelection().length) break;
                this.breakCurrentCommand();
                break;
            }
        }
    }

    private updateLineSpan() {
        const delta = this.#terminal.cols - this.#prompt.length;
        this.#lineSpan = Math.floor(this.userInput.length / delta);
    }

    private setCursorToIndex(index: number) {
        this.#terminal.write(ansi.cursorTo(this.#prompt.length - 2 + index));
    }

    private updateUserInput(data: string) {
        const newUserInput =
            this.userInput.substring(0, this.cursorInputIndex) +
            data +
            this.userInput.substring(this.cursorInputIndex);
        const oldCursorInputIndex = this.cursorInputIndex;
        this.replaceUserInput(newUserInput);
        this._cursorInputIndex = oldCursorInputIndex + data.length;
        this.setCursorToIndex(this.cursorInputIndex);
    }
}
