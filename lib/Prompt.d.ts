import TerminalCommander from './NrfTerminalCommander';
export default class Prompt {
    #private;
    constructor(commander: TerminalCommander, template: string);
    get value(): string;
    get length(): number;
}
