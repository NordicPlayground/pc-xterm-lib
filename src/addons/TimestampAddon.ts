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

import * as dateFns from 'date-fns';
import * as c from 'ansi-colors';
import * as ansi from 'ansi-escapes';
import { IDisposable } from 'xterm';

import NrfTerminalAddon from '../NrfTerminalAddon';
import NrfTerminalCommander from '../NrfTerminalCommander';
import { charCode, CharCodes } from '../utils';

/**
 * Prints the date and time a command was executed at the
 * rightmost edge of the screen.
 *
 * The format of the displayed timestamp can be set by
 * passing an alternative string to the constructor, or
 * by changing the `format` property at any time. By default, the
 * format is `HH:mm:ss`.
 *
 * Timestamps can be toggled using the `toggleTimestamps` method,
 * or by using the `"toggle_timestamps"` command registered by
 * this addon.
 */
export default class TimestampAddon extends NrfTerminalAddon {
    name = 'TimestampAddon';

    #showTimestamps = true;

    /**
     * The `date-fns` compatible formatter used to format the timestamp.
     */
    format: string;

    #onDataListener: IDisposable | null = null;

    constructor(commander: NrfTerminalCommander, format?: string) {
        super(commander);
        this.format = format || 'HH:mm:ss';
    }

    protected onActivate() {
        this.connect();
    }

    public connect(): void {
        // Clear all current connections
        this.disconnect();

        this.#onDataListener = this.terminal.onData(data => {
            if (this.showingTimestamps && charCode(data) === CharCodes.LF) {
                this.writeTimestamp();
            }
        });
    }

    public disconnect(): void {
        if (this.#onDataListener !== null) {
            this.#onDataListener.dispose();
            this.#onDataListener = null;
        }
    }

    private writeTimestamp(): void {
        const now = new Date();
        const formatted = dateFns.format(now, this.format);

        const endCols =
            this.terminal.cols -
            this.commander.userInput.length -
            formatted.length -
            this.commander.prompt.length;

        this.terminal.write(ansi.cursorForward(endCols));
        this.terminal.write(c.bold(c.grey(formatted)));
    }

    /**
     * Whether or not timestamps will be shown on new commands.
     */
    public get showingTimestamps(): boolean {
        return this.#showTimestamps;
    }

    /**
     * Toggles the printing of timestamps on or off.
     */
    public toggleTimestamps(): void {
        this.#showTimestamps = !this.showingTimestamps;
    }
}
