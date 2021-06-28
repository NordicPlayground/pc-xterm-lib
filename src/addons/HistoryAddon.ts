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
