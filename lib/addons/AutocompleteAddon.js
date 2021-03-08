"use strict";
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
var _isVisible, _suggestions, _root, _container, _completerFunction, _highlightedIndex, _prevUserInput, _hasCancelled;
Object.defineProperty(exports, "__esModule", { value: true });
const NrfTerminalAddon_1 = __importDefault(require("../NrfTerminalAddon"));
const HIGHLIGHTED_CLASS = 'autocomplete__suggestion--highlighted';
class AutocompleteAddon extends NrfTerminalAddon_1.default {
    constructor(commander, completer) {
        super(commander);
        this.name = 'AutocompleteAddon';
        _isVisible.set(this, false);
        _suggestions.set(this, []);
        _root.set(this, void 0);
        _container.set(this, void 0);
        _completerFunction.set(this, void 0);
        _highlightedIndex.set(this, 0);
        _prevUserInput.set(this, '');
        _hasCancelled.set(this, false);
        __classPrivateFieldSet(this, _completerFunction, completer);
    }
    get isVisible() {
        return __classPrivateFieldGet(this, _isVisible);
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
        this.terminal.onKey(({ domEvent }) => {
            switch (domEvent.code) {
                case 'ArrowUp':
                    return this.navigateUp();
                case 'ArrowDown':
                    return this.navigateDown();
                case 'Escape':
                    __classPrivateFieldSet(this, _hasCancelled, true);
                    return this.clearSuggestions();
                case 'Enter':
                    if (this.isVisible) {
                        return this.selectSuggestion(__classPrivateFieldGet(this, _highlightedIndex));
                    }
                // Swallow backspace keys so they don't revert the cancel.
                // This way the dialog will only appear again on a real keypress.
                case 'Backspace':
                    return;
            }
            __classPrivateFieldSet(this, _hasCancelled, false);
        });
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
        // Write out the portion of the value that hasn't already been typed.
        const completed = value.slice(this.commander.userInput.length);
        this.terminal.write(completed);
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
        __classPrivateFieldSet(this, _isVisible, true);
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
        __classPrivateFieldSet(this, _isVisible, false);
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
_isVisible = new WeakMap(), _suggestions = new WeakMap(), _root = new WeakMap(), _container = new WeakMap(), _completerFunction = new WeakMap(), _highlightedIndex = new WeakMap(), _prevUserInput = new WeakMap(), _hasCancelled = new WeakMap();
