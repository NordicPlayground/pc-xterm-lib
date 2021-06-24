import { IDisposable } from 'xterm';

import NrfTerminalAddon from '../NrfTerminalAddon';
import { isMac } from '../utils';

/**
 * Adds copy-paste functionality to the terminal, guaranteed to work
 * consistently across platforms. On a Mac, the addon is not
 * initialised, since the required functionality works out of the box.
 *
 * The registered shortcuts on Windows and Linux are Ctrl-C for copy,
 * and Ctrl-V for paste. On a Mac, the Cmd key replaces the Ctrl key.
 */
export default class CopyPasteAddon extends NrfTerminalAddon {
    name = 'CopyPasteAddon';

    #onKeyListener: IDisposable | null = null;

    protected onActivate() {
        if (isMac()) return;

        this.connect();
    }

    public connect(): void {
        // Clear all current connections
        this.disconnect();

        this.#onKeyListener = this.terminal.onKey(async ({ domEvent }) => {
            if (isCopy(domEvent)) {
                document.execCommand('copy');
            }

            if (isPaste(domEvent)) {
                navigator.clipboard.readText().then(clipText => {
                    const lines = clipText.split('\n');
                    const remainder = lines.pop();
                    lines.forEach(line => {
                        this.terminal.paste(line);
                        this.commander.runCommand(line.trim());
                    });
                    this.commander.replaceUserInput(remainder);
                });
            }
        });
    }

    public disconnect(): void {
        if (this.#onKeyListener !== null) {
            this.#onKeyListener.dispose();
            this.#onKeyListener = null;
        }
    }
}

function isCopy(e: KeyboardEvent): boolean {
    return e.ctrlKey && e.code === 'KeyC';
}

function isPaste(e: KeyboardEvent): boolean {
    return e.ctrlKey && e.code === 'KeyV';
}
