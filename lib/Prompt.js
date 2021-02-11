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
var _template, _commander;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class Prompt {
    constructor(commander, template) {
        _template.set(this, void 0);
        _commander.set(this, void 0);
        __classPrivateFieldSet(this, _template, `\n\r${template} `);
        __classPrivateFieldSet(this, _commander, commander);
    }
    get value() {
        return __classPrivateFieldGet(this, _template).replace(':lineCount', __classPrivateFieldGet(this, _commander).lineCount.toString());
    }
    get length() {
        return utils_1.stripAnsiCodes(this.value).length;
    }
}
exports.default = Prompt;
_template = new WeakMap(), _commander = new WeakMap();
