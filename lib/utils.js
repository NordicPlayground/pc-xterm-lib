"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripAnsiCodes = exports.isLinux = exports.isWindows = exports.isMac = exports.CharCodes = exports.charCode = void 0;
function charCode(str) {
    return str.charCodeAt(0);
}
exports.charCode = charCode;
exports.CharCodes = {
    EOL: '\n',
    LF: 13,
    BACKSPACE: 127,
    ARROW_KEY: 27,
    CTRL_C: 3,
    ESCAPE: 27,
};
function isMac() {
    return window.navigator.platform.startsWith('Mac');
}
exports.isMac = isMac;
function isWindows() {
    return window.navigator.platform.startsWith('Win');
}
exports.isWindows = isWindows;
function isLinux() {
    return window.navigator.platform.startsWith('Linux');
}
exports.isLinux = isLinux;
function stripAnsiCodes(str) {
    // eslint-disable-next-line
    const regex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return str.replace(regex, '');
}
exports.stripAnsiCodes = stripAnsiCodes;
