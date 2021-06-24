import NrfTerminalAddon from '../NrfTerminalAddon';
import NrfTerminalCommander from '../NrfTerminalCommander';
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
export default class TimestampAddon extends NrfTerminalAddon {
    #private;
    name: string;
    /**
     * The `date-fns` compatible formatter used to format the timestamp.
     */
    format: string;
    constructor(commander: NrfTerminalCommander, format?: string);
    protected onActivate(): void;
    connect(): void;
    disconnect(): void;
    private writeTimestamp;
    /**
     * Whether or not timestamps will be shown on new commands.
     */
    get showingTimestamps(): boolean;
    /**
     * Toggles the printing of timestamps on or off.
     */
    toggleTimestamps(): void;
}
