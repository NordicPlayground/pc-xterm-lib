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

    protected onActivate() {
        if (isMac()) return;

        this.terminal.onKey(async ({ domEvent }) => {
            if (isCopy(domEvent)) {
                document.execCommand('copy');
            }

            if (isPaste(domEvent)) {
                navigator.clipboard.readText().then(clipText => {
                    const lines = clipText.split('\n');
                    const remainder = lines.pop()!;
                    lines.forEach(line => {
                        this.terminal.paste(line);
                        this.commander.runCommand(line.trim());
                    });
                    this.commander.replaceInputWith(remainder)
                });
            }
        });
    }
}

function isCopy(e: KeyboardEvent): boolean {
    return e.ctrlKey && e.code === 'KeyC';
}

function isPaste(e: KeyboardEvent): boolean {
    return e.ctrlKey && e.code === 'KeyV';
}
