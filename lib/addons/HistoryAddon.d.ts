import NrfTerminalAddon from '../NrfTerminalAddon';
export default class HistoryAddon extends NrfTerminalAddon {
    #private;
    name: string;
    protected onActivate(): void;
    connect(): void;
    disconnect(): void;
    private addToHistory;
    private moveForwards;
    private moveBackwards;
    /**
     * A list of commands saved to the history list.
     */
    get history(): string[];
    /**
     * The command at the current history position.
     */
    get currentCommand(): string;
    /**
     * Moves the position in the history to the front, so the last
     * command to be saved will be the next one returned.
     */
    resetCursor(): void;
    /**
     * Removes all the commands saved into the history list.
     */
    clearHistory(): void;
}
