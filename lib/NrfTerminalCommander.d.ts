import { Terminal, ITerminalAddon } from 'xterm';
import Prompt from './Prompt';
import AutocompleteAddon, { CompleterFunction } from './addons/AutocompleteAddon';
import { HoverMetadata } from './addons/HoverAddon';
export interface KeyEvent {
    key: string;
    domEvent: KeyboardEvent;
}
export declare type OutputListener = (output: string) => void;
export interface NrfTerminalConfig {
    /**
     * The string to be displayed at the start of each new line.
     */
    prompt: string;
    /**
     * A function that, given the current output, returns the list
     * of autocompletion entries that should be displayed.
     *
     * @example
     * function completer(output: string) {
     *   const completions: Completion[] = [
     *      {
     *        value: "toggle_autcomplete",
     *        description: "Toggles autocompletion on and off."
     *      }
     *   ];
     *
     *   return completions.filter(c => c.value.beginsWith(output));
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
    commands: {
        [name: string]: () => void;
    };
    hoverMetadata: HoverMetadata[];
    /**
     * Whether or not timestamps should be displayed after each command
     * is run.
     */
    showTimestamps: boolean;
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
    #private;
    autocompleteAddon: AutocompleteAddon;
    constructor(config: NrfTerminalConfig);
    activate(terminal: Terminal): void;
    dispose(): boolean;
    /**
     * The value of the current line.
     */
    get output(): string;
    private set _output(value);
    /**
     * The number of lines spanned by the current command.
     */
    get lineSpan(): number;
    get lineCount(): number;
    get prompt(): Prompt;
    /**
     * Registers the given `command` in the terminal, such that when it is
     * executed `callback` is run.
     * @param command The command to listen for.
     * @param callback The function to run when the command is given.
     */
    private registerCommand;
    /**
     * Registers a function that will be called whenever the output changes,
     * with the new output value.
     * @param listener The function to call when the output changes.
     */
    registerOutputListener(listener: (output: string) => void): void;
    /**
     * Removes the command currently being entered into the buffer
     * and replaces it with `newCommand`.
     * @param newCommand The command to write to the screen.
     */
    replaceInputWith(newCommand: string): void;
    /**
     * Returns `true` if the cursor is placed at the beginning of
     * the line (i.e. right after the prompt), otherwise `false`.
     */
    atBeginningOfLine(): boolean;
    /**
     * Returns `true` if the cursor is placed at the end of
     * the line (i.e. one character after the final one typed),
     * otherwise `false`.
     */
    atEndOfLine(): boolean;
    /**
     * Removes all the typed characters on the current line, and
     * moves the cursor to the beginning.
     */
    clearInput(): void;
    private backspace;
    private moveCaretLeft;
    private moveCaretRight;
    private runCommand;
    /**
     * Prints a new prompt and removes the currently entered
     * text. Useful whenever a new line of input needs to be
     * started, i.e. because a command was just run.
     */
    private breakCurrentCommand;
    private onData;
    private onKey;
    private updateLineSpan;
}
