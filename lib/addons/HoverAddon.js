"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NrfTerminalAddon_1 = __importDefault(require("../NrfTerminalAddon"));
class HoverAddon extends NrfTerminalAddon_1.default {
    constructor(commander, hoverMetadata) {
        super(commander);
        this.name = 'HoverAddon';
        this.hoverMetadata = hoverMetadata;
    }
    onActivate() {
        const r = new RegExp('I will match');
        this.terminal.registerLinkMatcher(r, (e, uri) => {
            console.log('You clicked on the special matching phrase');
        });
    }
}
exports.default = HoverAddon;
