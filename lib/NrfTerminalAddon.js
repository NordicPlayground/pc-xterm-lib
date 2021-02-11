"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Manages the lifecycle of a terminal extension, and provides
 * access to the `xterm.js` and `TerminalCommander` instances.
 */
class NrfTerminalAddon {
    constructor(commander) {
        this.commander = commander;
    }
    debug(message, ...meta) {
        console.debug(`[${this.name}] ${message}`, meta);
    }
    activate(terminal) {
        console.info(`Loaded ${this.name}`);
        this.terminal = terminal;
        this.onActivate();
    }
    dispose() {
        console.debug(`Disposing of ${this.name}`);
    }
}
exports.default = NrfTerminalAddon;
