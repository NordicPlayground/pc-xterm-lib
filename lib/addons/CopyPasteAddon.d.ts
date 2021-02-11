import NrfTerminalAddon from '../NrfTerminalAddon';
/**
 * Adds copy-paste functionality to the terminal, guaranteed to work
 * consistently across platforms. On a Mac, the addon is not
 * initialised, since the required functionality works out of the box.
 *
 * The registered shortcuts on Windows and Linux are Ctrl-C for copy,
 * and Ctrl-V for paste. On a Mac, the Cmd key replaces the Ctrl key.
 */
export default class CopyPasteAddon extends NrfTerminalAddon {
    name: string;
    protected onActivate(): void;
}
