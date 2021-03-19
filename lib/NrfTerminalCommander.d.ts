import { Terminal, ITerminalAddon } from 'xterm';
import Prompt from './Prompt';
import AutocompleteAddon, { CompleterFunction } from './addons/AutocompleteAddon';
import { HoverMetadata } from './addons/HoverAddon';
export interface KeyEvent {
    key: string;
    domEvent: KeyboardEvent;
}
export declare type UserInputChangeListener = (userInput: string) => void;
export declare type RunCommandListener = (command: string) => void;
export interface NrfTerminalConfig {
    /**
     * The string to be displayed at the start of each new line.
     */
    prompt: string;
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
    commands: {
        [name: string]: () => void;
    };
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
     * The current user input.
     */
    get userInput(): string;
    private set _userInput(value);
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
     * Registers all custom commands from the provided config
     */
    private registerCustomCommands;
    /**
     * Registers a function that will be called whenever the user input changes,
     * with the new user input.
     * @param listener The function to call when the user input changes.
     * @returns a function to unregister the listener
     */
    onUserInputChange(listener: UserInputChangeListener): () => void;
    /**
     * Registers a function that will be called whenever the a command is run,
     * with the command value.
     * @param listener The function to call when a command is run.
     * @returns a function to unregister the listener
     */
    onRunCommand(listener: RunCommandListener): () => void;
    /**
     * Replaces the user input currently being entered into the buffer.
     * @param newUserInput The user input written to the screen. Defaults to an empty string.
     */
    replaceUserInput(newUserInput?: string): void;
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
    clearUserInput(): void;
    private backspace;
    private moveCaretLeft;
    private moveCaretRight;
    runCommand(cmd?: string): void;
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
