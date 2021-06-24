import NrfTerminalAddon from '../NrfTerminalAddon';
import NrfTerminalCommander from '../NrfTerminalCommander';
export interface HoverMetadata {
    match: RegExp;
    title: string;
    body: string;
}
export default class HoverAddon extends NrfTerminalAddon {
    name: string;
    hoverMetadata: HoverMetadata[];
    constructor(commander: NrfTerminalCommander, hoverMetadata: HoverMetadata[]);
    protected onActivate(): void;
    connect(): void;
    disconnect(): void;
}
