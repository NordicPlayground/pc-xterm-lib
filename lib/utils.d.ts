export declare function charCode(str: string): number;
export declare const CharCodes: {
    EOL: string;
    LF: number;
    BACKSPACE: number;
    ARROW_KEY: number;
    CTRL_C: number;
    ESCAPE: number;
};
export declare function isMac(): boolean;
export declare function isWindows(): boolean;
export declare function isLinux(): boolean;
export declare function stripAnsiCodes(str: string): string;
