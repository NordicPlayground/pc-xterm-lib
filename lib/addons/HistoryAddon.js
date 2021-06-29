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
var _history, _currentIndex, _onDataListener, _onKeyListener;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const NrfTerminalAddon_1 = __importDefault(require("../NrfTerminalAddon"));
class HistoryAddon extends NrfTerminalAddon_1.default {
    constructor() {
        super(...arguments);
        this.name = 'HistoryAddon';
        _history.set(this, []);
        _currentIndex.set(this, -1);
        _onDataListener.set(this, null);
        _onKeyListener.set(this, null);
    }
    onActivate() {
        this.commander.onRunCommand(command => {
            this.addToHistory(command);
        });
        this.connect();
    }
    connect() {
        // Clear all current connections
        this.disconnect();
        __classPrivateFieldSet(this, _onDataListener, this.terminal.onData(data => {
            if (utils_1.charCode(data) === utils_1.CharCodes.LF &&
                this.commander.userInput.trim().length) {
                this.resetCursor();
            }
        }));
        __classPrivateFieldSet(this, _onKeyListener, this.terminal.onKey(e => {
            if (!this.commander.autocompleteAddon.isVisible) {
                // Don't show the autocomplete dialog when travelling through time.
                this.commander.autocompleteAddon.disable();
                switch (e.domEvent.key) {
                    case 'ArrowUp':
                        return this.moveBackwards();
                    case 'ArrowDown':
                        return this.moveForwards();
                }
            }
        }));
    }
    disconnect() {
        if (__classPrivateFieldGet(this, _onDataListener) !== null) {
            __classPrivateFieldGet(this, _onDataListener).dispose();
            __classPrivateFieldSet(this, _onDataListener, null);
        }
        if (__classPrivateFieldGet(this, _onKeyListener) !== null) {
            __classPrivateFieldGet(this, _onKeyListener).dispose();
            __classPrivateFieldSet(this, _onKeyListener, null);
        }
    }
    addToHistory(command) {
        const latestEntry = __classPrivateFieldGet(this, _history)[0];
        if (latestEntry === command || command.trim() === '') {
            return;
        }
        __classPrivateFieldGet(this, _history).unshift(command);
    }
    moveForwards() {
        if (__classPrivateFieldGet(this, _currentIndex) < 0)
            return;
        __classPrivateFieldSet(this, _currentIndex, __classPrivateFieldGet(this, _currentIndex) - 1);
        const command = __classPrivateFieldGet(this, _currentIndex) === -1 ? '' : this.currentCommand;
        this.commander.replaceUserInput(command);
    }
    moveBackwards() {
        if (__classPrivateFieldGet(this, _currentIndex) >= this.history.length - 1)
            return;
        __classPrivateFieldSet(this, _currentIndex, __classPrivateFieldGet(this, _currentIndex) + 1);
        this.commander.replaceUserInput(this.currentCommand);
    }
    /**
     * A list of commands saved to the history list.
     */
    get history() {
        return __classPrivateFieldGet(this, _history);
    }
    /**
     * The command at the current history position.
     */
    get currentCommand() {
        return this.history[__classPrivateFieldGet(this, _currentIndex)];
    }
    /**
     * Moves the position in the history to the front, so the last
     * command to be saved will be the next one returned.
     */
    resetCursor() {
        __classPrivateFieldSet(this, _currentIndex, -1);
    }
    /**
     * Removes all the commands saved into the history list.
     */
    clearHistory() {
        __classPrivateFieldSet(this, _history, []);
        __classPrivateFieldSet(this, _currentIndex, -1);
    }
}
exports.default = HistoryAddon;
_history = new WeakMap(), _currentIndex = new WeakMap(), _onDataListener = new WeakMap(), _onKeyListener = new WeakMap();
