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
var _onKeyListener;
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
        _onKeyListener.set(this, null);
    }
    onActivate() {
        if (utils_1.isMac())
            return;
        this.connect();
    }
    connect() {
        // Clear all current connections
        this.disconnect();
        __classPrivateFieldSet(this, _onKeyListener, this.terminal.onKey(async ({ domEvent }) => {
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
        }));
    }
    disconnect() {
        if (__classPrivateFieldGet(this, _onKeyListener) !== null) {
            __classPrivateFieldGet(this, _onKeyListener).dispose();
            __classPrivateFieldSet(this, _onKeyListener, null);
        }
    }
}
exports.default = CopyPasteAddon;
_onKeyListener = new WeakMap();
function isCopy(e) {
    return e.ctrlKey && e.code === 'KeyC';
}
function isPaste(e) {
    return e.ctrlKey && e.code === 'KeyV';
}
