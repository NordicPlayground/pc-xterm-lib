"use strict";
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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _showTimestamps, _onDataListener;
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
        _onDataListener.set(this, null);
        this.format = format || 'HH:mm:ss';
    }
    onActivate() {
        this.connect();
    }
    connect() {
        // Clear all current connections
        this.disconnect();
        __classPrivateFieldSet(this, _onDataListener, this.terminal.onData(data => {
            if (this.showingTimestamps && utils_1.charCode(data) === utils_1.CharCodes.LF) {
                this.writeTimestamp();
            }
        }));
    }
    disconnect() {
        if (__classPrivateFieldGet(this, _onDataListener) !== null) {
            __classPrivateFieldGet(this, _onDataListener).dispose();
            __classPrivateFieldSet(this, _onDataListener, null);
        }
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
_showTimestamps = new WeakMap(), _onDataListener = new WeakMap();
