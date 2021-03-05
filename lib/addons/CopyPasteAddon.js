"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NrfTerminalAddon_1 = __importDefault(require("../NrfTerminalAddon"));
const utils_1 = require("../utils");
/**
 * Adds copy-paste functionality to the terminal, guaranteed to work
 * consistently across platforms. On a Mac, the addon is not
 * initialised, since the required functionality works out of the box.
 *
 * The registered shortcuts on Windows and Linux are Ctrl-C for copy,
 * and Ctrl-V for paste. On a Mac, the Cmd key replaces the Ctrl key.
 */
class CopyPasteAddon extends NrfTerminalAddon_1.default {
    constructor() {
        super(...arguments);
        this.name = 'CopyPasteAddon';
    }
    onActivate() {
        if (utils_1.isMac())
            return;
        this.terminal.onKey(async ({ domEvent }) => {
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
                    this.commander.replaceInputWith(remainder);
                });
            }
        });
    }
}
exports.default = CopyPasteAddon;
function isCopy(e) {
    return e.ctrlKey && e.code === 'KeyC';
}
function isPaste(e) {
    return e.ctrlKey && e.code === 'KeyV';
}
