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
var _suggestions, _root, _container, _completerFunction, _highlightedIndex, _prevUserInput, _hasCancelled, _onKeyListener;
Object.defineProperty(exports, "__esModule", { value: true });
const NrfTerminalAddon_1 = __importDefault(require("../NrfTerminalAddon"));
const HIGHLIGHTED_CLASS = 'autocomplete__suggestion--highlighted';
class AutocompleteAddon extends NrfTerminalAddon_1.default {
    constructor(commander, completer) {
        super(commander);
        this.name = 'AutocompleteAddon';
        _suggestions.set(this, []);
        _root.set(this, void 0);
        _container.set(this, void 0);
        _completerFunction.set(this, void 0);
        _highlightedIndex.set(this, 0);
        _prevUserInput.set(this, '');
        _hasCancelled.set(this, false);
        _onKeyListener.set(this, null);
        __classPrivateFieldSet(this, _completerFunction, completer);
    }
    get isVisible() {
        return __classPrivateFieldGet(this, _suggestions).length > 0;
    }
    disable() {
        __classPrivateFieldSet(this, _hasCancelled, true);
    }
    enable() {
        __classPrivateFieldSet(this, _hasCancelled, false);
    }
    get completions() {
        return __classPrivateFieldGet(this, _completerFunction).call(this, this.commander.userInput);
    }
    onActivate() {
        this.commander.onUserInputChange(userInput => {
            if (!__classPrivateFieldGet(this, _container)) {
                this.initialiseContainer();
            }
            if (!__classPrivateFieldGet(this, _hasCancelled)) {
                this.patchSuggestionBox(userInput);
                this.repositionX(userInput);
                this.repositionY(this.commander.lineCount);
            }
        });
        this.connect();
    }
    connect() {
        // Clear all current connections
        this.disconnect();
        __classPrivateFieldSet(this, _onKeyListener, this.terminal.onKey(({ domEvent }) => {
            switch (domEvent.code) {
                case 'ArrowUp':
                    if (this.isVisible)
                        return this.navigateUp();
                case 'ArrowDown':
                    if (this.isVisible)
                        return this.navigateDown();
                case 'Escape':
                    __classPrivateFieldSet(this, _hasCancelled, true);
                    return this.clearSuggestions();
                case 'Enter':
                    if (this.isVisible)
                        return this.selectSuggestion(__classPrivateFieldGet(this, _highlightedIndex));
                // Swallow backspace keys so they don't revert the cancel.
                // This way the dialog will only appear again on a real keypress.
                case 'Backspace':
                    return;
            }
            __classPrivateFieldSet(this, _hasCancelled, false);
        }));
    }
    disconnect() {
        if (__classPrivateFieldGet(this, _onKeyListener) !== null) {
            __classPrivateFieldGet(this, _onKeyListener).dispose();
            __classPrivateFieldSet(this, _onKeyListener, null);
        }
    }
    initialiseContainer() {
        if (!this.terminal.element) {
            this.debug('Terminal must be fully loaded');
            return;
        }
        const autocompleteRoot = document.createElement('div');
        autocompleteRoot.className = 'autocomplete';
        __classPrivateFieldSet(this, _root, autocompleteRoot);
        const suggestionsContainer = document.createElement('ul');
        suggestionsContainer.className = 'autocomplete__suggestions';
        autocompleteRoot.appendChild(suggestionsContainer);
        this.terminal.element.appendChild(autocompleteRoot);
        __classPrivateFieldSet(this, _container, suggestionsContainer);
    }
    navigateUp() {
        // If we're already on the first item, loop back to the last.
        if (__classPrivateFieldGet(this, _highlightedIndex) === 0) {
            this.highlightSuggestion(__classPrivateFieldGet(this, _suggestions).length - 1);
        }
        else {
            this.highlightSuggestion(__classPrivateFieldGet(this, _highlightedIndex) - 1);
        }
    }
    navigateDown() {
        // If we're already on the last item, loop back to the start.
        if (__classPrivateFieldGet(this, _highlightedIndex) === __classPrivateFieldGet(this, _suggestions).length - 1) {
            this.highlightSuggestion(0);
        }
        else {
            this.highlightSuggestion(__classPrivateFieldGet(this, _highlightedIndex) + 1);
        }
    }
    selectSuggestion(id) {
        const { value } = this.completions[id];
        this.commander.replaceUserInput(value);
        this.clearSuggestions();
    }
    patchSuggestionBox(userInput) {
        if (!userInput.length) {
            this.clearSuggestions();
            return;
        }
        for (let i = 0; i < this.completions.length; i += 1) {
            const completion = this.completions[i];
            const isMatch = completion.value.startsWith(userInput);
            const alreadyShowing = __classPrivateFieldGet(this, _suggestions).includes(i);
            if (isMatch && alreadyShowing) {
                if (userInput.length < __classPrivateFieldGet(this, _prevUserInput).length) {
                    this.shrinkMatch(i);
                }
                else {
                    this.growMatch(i);
                }
            }
            else if (isMatch && !alreadyShowing) {
                this.addSuggestion(i, userInput);
            }
            else if (!isMatch && alreadyShowing) {
                this.removeSuggestion(i);
            }
        }
        __classPrivateFieldSet(this, _prevUserInput, userInput);
    }
    addSuggestion(id, userInput) {
        var _a;
        const { value: suggestionValue } = this.completions[id];
        const matchedSpan = document.createElement('span');
        matchedSpan.textContent = userInput;
        matchedSpan.className = 'font-weight-bolder';
        matchedSpan.dataset.type = 'matched';
        const unmatchedSpan = document.createElement('span');
        const regex = new RegExp(`^${userInput}`, 'gm');
        const unmatchedFragment = suggestionValue.split(regex)[1];
        unmatchedSpan.textContent = unmatchedFragment;
        unmatchedSpan.dataset.type = 'unmatched';
        const suggestionLi = document.createElement('li');
        suggestionLi.classList.add('autocomplete__suggestion');
        suggestionLi.appendChild(matchedSpan);
        suggestionLi.appendChild(unmatchedSpan);
        suggestionLi.dataset.suggestionId = id.toString();
        if (__classPrivateFieldGet(this, _highlightedIndex) === id) {
            suggestionLi.classList.add(HIGHLIGHTED_CLASS);
        }
        (_a = __classPrivateFieldGet(this, _container)) === null || _a === void 0 ? void 0 : _a.appendChild(suggestionLi);
        __classPrivateFieldGet(this, _suggestions).push(id);
    }
    removeSuggestion(id) {
        var _a;
        const suggestion = this.getSuggestionElement(id);
        (_a = __classPrivateFieldGet(this, _container)) === null || _a === void 0 ? void 0 : _a.removeChild(suggestion);
        __classPrivateFieldSet(this, _suggestions, __classPrivateFieldGet(this, _suggestions).filter(i => i !== id));
    }
    growMatch(id) {
        const suggestion = this.getSuggestionElement(id);
        const [matched, unmatched] = suggestion.querySelectorAll('span');
        matched.textContent += unmatched.textContent[0];
        unmatched.textContent = unmatched.textContent.slice(1);
    }
    shrinkMatch(id) {
        const suggestion = this.getSuggestionElement(id);
        const [matched, unmatched] = suggestion.querySelectorAll('span');
        const lastCharacter = matched.textContent.slice(-1);
        matched.textContent = matched.textContent.slice(0, -1);
        unmatched.textContent = lastCharacter + unmatched.textContent;
    }
    highlightSuggestion(id) {
        const prev = this.getSuggestionElement(__classPrivateFieldGet(this, _highlightedIndex));
        prev.classList.remove(HIGHLIGHTED_CLASS);
        const current = this.getSuggestionElement(id);
        current.classList.add(HIGHLIGHTED_CLASS);
        __classPrivateFieldSet(this, _highlightedIndex, id);
    }
    clearSuggestions() {
        if (!__classPrivateFieldGet(this, _container))
            return;
        __classPrivateFieldGet(this, _container).innerHTML = '';
        __classPrivateFieldSet(this, _suggestions, []);
        __classPrivateFieldSet(this, _highlightedIndex, 0);
    }
    getSuggestionElement(id) {
        var _a;
        const suggestionLi = (_a = __classPrivateFieldGet(this, _container)) === null || _a === void 0 ? void 0 : _a.querySelector(`[data-suggestion-id="${id}"]`);
        if (!suggestionLi) {
            throw new Error(`No suggestion element with index ${id} found`);
        }
        return suggestionLi;
    }
    repositionX(userInput) {
        const left = userInput.length * 3.5 + 80 + (5 * userInput.length - 1) - 3.5;
        __classPrivateFieldGet(this, _root).style.left = `${left}px`;
    }
    repositionY(lineNo) {
        const top = lineNo * 37;
        __classPrivateFieldGet(this, _root).style.top = `${top}px`;
    }
}
exports.default = AutocompleteAddon;
_suggestions = new WeakMap(), _root = new WeakMap(), _container = new WeakMap(), _completerFunction = new WeakMap(), _highlightedIndex = new WeakMap(), _prevUserInput = new WeakMap(), _hasCancelled = new WeakMap(), _onKeyListener = new WeakMap();
