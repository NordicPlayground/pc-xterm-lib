import NrfTerminalAddon from '../NrfTerminalAddon';
import NrfTerminalCommander from '../NrfTerminalCommander';
export interface Completion {
    value: string;
    description: string;
}
export declare type CompleterFunction = (userInput: string) => Completion[];
export default class AutocompleteAddon extends NrfTerminalAddon {
    #private;
    name: string;
    constructor(commander: NrfTerminalCommander, completer: CompleterFunction);
    connect(): void;
    disconnect(): void;
    get isVisible(): boolean;
    disable(): void;
    enable(): void;
    private get completions();
    protected onActivate(): void;
    private initialiseContainer;
    private navigateUp;
    private navigateDown;
    private selectSuggestion;
    private patchSuggestionBox;
    private addSuggestion;
    private removeSuggestion;
    private growMatch;
    private shrinkMatch;
    private highlightSuggestion;
    private clearSuggestions;
    private getSuggestionElement;
    private repositionX;
    private repositionY;
}
