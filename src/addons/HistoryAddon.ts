import { IDisposable } from 'xterm';

import { charCode, CharCodes } from '../utils';
import NrfTerminalAddon from '../NrfTerminalAddon';

export default class HistoryAddon extends NrfTerminalAddon {
    name = 'HistoryAddon';

    #history: string[] = [];
    #currentIndex = -1;

    #onDataListener: IDisposable | null = null;
    #onKeyListener: IDisposable | null = null;

    protected onActivate(): void {
        this.commander.onRunCommand(command => {
            this.addToHistory(command);
        });

        this.connect();
    }

    public connect(): void {
        // Clear all current connections
        this.disconnect();

        this.#onDataListener = this.terminal.onData(data => {
            if (
                charCode(data) === CharCodes.LF &&
                this.commander.userInput.trim().length
            ) {
                this.resetCursor();
            }
        });

        this.#onKeyListener = this.terminal.onKey(e => {
            if (!this.commander.autocompleteAddon.isVisible) {
                // Don't show the autocomplete dialog when travelling through time.
                this.commander.autocompleteAddon.disable();
                switch (e.domEvent.key) {
                    case 'ArrowUp':
                        return this.moveBackwards();
                    case 'ArrowDown':
                        return this.moveForwards();
                }
            }
        });
    }

    public disconnect(): void {
        if (this.#onDataListener !== null) {
            this.#onDataListener.dispose();
            this.#onDataListener = null;
        }

        if (this.#onKeyListener !== null) {
            this.#onKeyListener.dispose();
            this.#onKeyListener = null;
        }
    }

    private addToHistory(command: string): void {
        const latestEntry = this.#history[0];
        if (latestEntry === command || command.trim() === '') {
            return;
        }
        this.#history.unshift(command);
    }

    private moveForwards(): void {
        if (this.#currentIndex < 0) return;
        this.#currentIndex -= 1;
        const command = this.#currentIndex === -1 ? '' : this.currentCommand;
        this.commander.replaceUserInput(command);
    }

    private moveBackwards(): void {
        if (this.#currentIndex >= this.history.length - 1) return;
        this.#currentIndex += 1;
        this.commander.replaceUserInput(this.currentCommand);
    }

    /**
     * A list of commands saved to the history list.
     */
    public get history() {
        return this.#history;
    }

    /**
     * The command at the current history position.
     */
    public get currentCommand(): string {
        return this.history[this.#currentIndex];
    }

    /**
     * Moves the position in the history to the front, so the last
     * command to be saved will be the next one returned.
     */
    public resetCursor(): void {
        this.#currentIndex = -1;
    }

    /**
     * Removes all the commands saved into the history list.
     */
    public clearHistory(): void {
        this.#history = [];
        this.#currentIndex = -1;
    }
}
