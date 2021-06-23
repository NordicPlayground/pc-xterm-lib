import { Terminal, ITerminalAddon } from 'xterm';
import NrfTerminalCommander from './NrfTerminalCommander';

/**
 * Manages the lifecycle of a terminal extension, and provides
 * access to the `xterm.js` and `TerminalCommander` instances.
 */
export default abstract class NrfTerminalAddon implements ITerminalAddon {
    /**
     * The name of the addon, used to identify it in debug messages and similar.
     */
    abstract name: string;

    protected terminal!: Terminal;
    protected commander: NrfTerminalCommander;

    constructor(commander: NrfTerminalCommander) {
        this.commander = commander;
    }

    /**
     * Called when the addon is first loaded into the `xterm.js`
     * terminal instance.
     *
     * All the addon's setup code, i.e. registering event listeners,
     * should take place here.
     */
    protected abstract onActivate(): void;

    protected debug(message: string, ...meta: unknown[]) {
        console.debug(`[${this.name}] ${message}`, meta);
    }

    public activate(terminal: Terminal) {
        console.info(`Loaded ${this.name}`);
        this.terminal = terminal;
        this.onActivate();
    }

    public dispose() {
        console.debug(`Disposing of ${this.name}`);
    }

    /**
     * Connects up any onData and onKey handlers
     */
    public abstract connect(): void;

    /**
     * Disconnects any onData and onKey handlers to allow terminal to function in a pure character mode
     */
    public abstract disconnect(): void;
}
