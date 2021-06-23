"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _showTimestamps;
Object.defineProperty(exports, "__esModule", { value: true });
const dateFns = __importStar(require("date-fns"));
const c = __importStar(require("ansi-colors"));
const ansi = __importStar(require("ansi-escapes"));
const NrfTerminalAddon_1 = __importDefault(require("../NrfTerminalAddon"));
const utils_1 = require("../utils");
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
class TimestampAddon extends NrfTerminalAddon_1.default {
    constructor(commander, format) {
        super(commander);
        this.name = 'TimestampAddon';
        _showTimestamps.set(this, true);
        this.format = format || 'HH:mm:ss';
    }
    onActivate() {
        this.terminal.onData(data => {
            if (this.showingTimestamps && utils_1.charCode(data) === utils_1.CharCodes.LF) {
                this.writeTimestamp();
            }
        });
    }
    connect() {
        // TODO: Implement
    }
    disconnect() {
        // TODO: Implement
    }
    writeTimestamp() {
        const now = new Date();
        const formatted = dateFns.format(now, this.format);
        const endCols = this.terminal.cols -
            this.commander.userInput.length -
            formatted.length -
            this.commander.prompt.length;
        this.terminal.write(ansi.cursorForward(endCols));
        this.terminal.write(c.bold(c.grey(formatted)));
    }
    /**
     * Whether or not timestamps will be shown on new commands.
     */
    get showingTimestamps() {
        return __classPrivateFieldGet(this, _showTimestamps);
    }
    /**
     * Toggles the printing of timestamps on or off.
     */
    toggleTimestamps() {
        __classPrivateFieldSet(this, _showTimestamps, !this.showingTimestamps);
    }
}
exports.default = TimestampAddon;
_showTimestamps = new WeakMap();
