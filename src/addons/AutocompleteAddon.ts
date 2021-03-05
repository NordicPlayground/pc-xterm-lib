import NrfTerminalAddon from '../NrfTerminalAddon';
import NrfTerminalCommander from '../NrfTerminalCommander';

export interface Completion {
    value: string;
    description: string;
}

export type CompleterFunction = (userInput: string) => Completion[];

const HIGHLIGHTED_CLASS = 'autocomplete__suggestion--highlighted';

export default class AutocompleteAddon extends NrfTerminalAddon {
    name = 'AutocompleteAddon';

    #isVisible = false;
    #suggestions: number[] = [];
    #root?: HTMLDivElement;
    #container?: HTMLUListElement;
    #completerFunction: CompleterFunction;
    #highlightedIndex = 0;
    #prevUserInput = '';
    #hasCancelled = false;

    constructor(commander: NrfTerminalCommander, completer: CompleterFunction) {
        super(commander);
        this.#completerFunction = completer;
    }

    public get isVisible() {
        return this.#isVisible;
    }

    public disable() {
        this.#hasCancelled = true;
    }

    public enable() {
        this.#hasCancelled = false;
    }

    private get completions(): Completion[] {
        return this.#completerFunction(this.commander.userInput);
    }

    protected onActivate() {
        this.commander.registerUserInputChangeListener(userInput => {
            if (!this.#container) {
                this.initialiseContainer();
            }

            if (!this.#hasCancelled) {
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
                    this.#hasCancelled = true;
                    return this.clearSuggestions();
                case 'Enter':
                    if (this.isVisible) {
                        return this.selectSuggestion(this.#highlightedIndex);
                    }
                // Swallow backspace keys so they don't revert the cancel.
                // This way the dialog will only appear again on a real keypress.
                case 'Backspace':
                    return;
            }

            this.#hasCancelled = false;
        });
    }

    private initialiseContainer(): void {
        if (!this.terminal.element) {
            this.debug('Terminal must be fully loaded');
            return;
        }

        const autocompleteRoot = document.createElement('div');
        autocompleteRoot.className = 'autocomplete';
        this.#root = autocompleteRoot;

        const suggestionsContainer = document.createElement('ul');
        suggestionsContainer.className = 'autocomplete__suggestions';
        autocompleteRoot.appendChild(suggestionsContainer);

        this.terminal.element.appendChild(autocompleteRoot);
        this.#container = suggestionsContainer;
    }

    private navigateUp(): void {
        // If we're already on the first item, loop back to the last.
        if (this.#highlightedIndex === 0) {
            this.highlightSuggestion(this.#suggestions.length - 1);
        } else {
            this.highlightSuggestion(this.#highlightedIndex - 1);
        }
    }

    private navigateDown(): void {
        // If we're already on the last item, loop back to the start.
        if (this.#highlightedIndex === this.#suggestions.length - 1) {
            this.highlightSuggestion(0);
        } else {
            this.highlightSuggestion(this.#highlightedIndex + 1);
        }
    }

    private selectSuggestion(id: number): void {
        const { value } = this.completions[id];
        // Write out the portion of the value that hasn't already been typed.
        const completed = value.slice(this.commander.userInput.length);
        this.terminal.write(completed);
        this.clearSuggestions();
    }

    private patchSuggestionBox(userInput: string): void {
        if (!userInput.length) {
            this.clearSuggestions();
            return;
        }

        for (let i = 0; i < this.completions.length; i += 1) {
            const completion = this.completions[i];
            const isMatch = completion.value.startsWith(userInput);
            const alreadyShowing = this.#suggestions.includes(i);

            if (isMatch && alreadyShowing) {
                if (userInput.length < this.#prevUserInput.length) {
                    this.shrinkMatch(i);
                } else {
                    this.growMatch(i);
                }
            } else if (isMatch && !alreadyShowing) {
                this.addSuggestion(i, userInput);
            } else if (!isMatch && alreadyShowing) {
                this.removeSuggestion(i);
            }
        }

        this.#prevUserInput = userInput;
    }

    private addSuggestion(id: number, userInput: string): void {
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

        if (this.#highlightedIndex === id) {
            suggestionLi.classList.add(HIGHLIGHTED_CLASS);
        }

        this.#container?.appendChild(suggestionLi);
        this.#suggestions.push(id);
        this.#isVisible = true;
    }

    private removeSuggestion(id: number): void {
        const suggestion = this.getSuggestionElement(id);
        this.#container?.removeChild(suggestion);
        this.#suggestions = this.#suggestions.filter(i => i !== id);
    }

    private growMatch(id: number): void {
        const suggestion = this.getSuggestionElement(id);
        const [matched, unmatched] = suggestion.querySelectorAll('span');
        matched.textContent += (unmatched.textContent as string)[0];
        unmatched.textContent = (unmatched.textContent as string).slice(1);
    }

    private shrinkMatch(id: number): void {
        const suggestion = this.getSuggestionElement(id);
        const [matched, unmatched] = suggestion.querySelectorAll('span');
        const lastCharacter = (matched.textContent as string).slice(-1);
        matched.textContent = (matched.textContent as string).slice(0, -1);
        unmatched.textContent = lastCharacter + unmatched.textContent;
    }

    private highlightSuggestion(id: number) {
        const prev = this.getSuggestionElement(this.#highlightedIndex);
        prev.classList.remove(HIGHLIGHTED_CLASS);
        const current = this.getSuggestionElement(id);
        current.classList.add(HIGHLIGHTED_CLASS);
        this.#highlightedIndex = id;
    }

    private clearSuggestions(): void {
        if (!this.#container) return;
        this.#container.innerHTML = '';
        this.#suggestions = [];
        this.#isVisible = false;
        this.#highlightedIndex = 0;
    }

    private getSuggestionElement(id: number): HTMLLIElement {
        const suggestionLi = this.#container?.querySelector(
            `[data-suggestion-id="${id}"]`
        );

        if (!suggestionLi) {
            throw new Error(`No suggestion element with index ${id} found`);
        }

        return suggestionLi as HTMLLIElement;
    }

    private repositionX(userInput: string): void {
        const left =
            userInput.length * 3.5 + 80 + (5 * userInput.length - 1) - 3.5;
        this.#root!.style.left = `${left}px`;
    }

    private repositionY(lineNo: number): void {
        const top = lineNo * 37;
        this.#root!.style.top = `${top}px`;
    }
}
