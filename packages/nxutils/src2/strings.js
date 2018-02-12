import { isVoid, isFunc, isValue } from './is-x';
import { defaults } from './objects';

let reObjectProtoToStr = /^\[object [a-zA-Z$_][a-zA-Z$_0-9]*\]$/;
export function tryStringify(inp, def) {
    let o = unwrap ? unwrap(inp) : inp;
    if (isVoid(o)) return def;
    if (isValue(o)) return String(o);

    if (isFunc(o.toString)) {
        let str = o.toString();
        if (!isVoid(str) && !reObjectProtoToStr.test(str))
            return String(str);
    }

    if (isFunc(o.valueOf)) {
        let oo = o.valueOf();
        if (oo !== o) return tryStringify(oo, def);
    }

    return def;
}

let reStrFormatPlaceholder = /\$([a-z0-9_]+)/gi;
export function format(s, vars) {
    return s.replace(reStrFormatPlaceholder, (x, y) => vars[y]);
}

let reMakeValueIdentifier = /([^a-zA-Z0-9_]+)([a-z]?)/g;
export function toValidIdentifier(str) {
    return str.replace(reMakeValueIdentifier,
        (i, x, y) => y && x.length < 2 ? y.toUpperCase() : '_' + y
    );
}

let reCamelCaseStr = /(^|\-)([a-z])/gi;
export function camelCase(str) {
    return str.replace(reCamelCaseStr,
        (s, x, y) => x ? y.toUpperCase() : y.toLowerCase()
    );
}

defaults(String.prototype, {
    startsWith(prefix) {
        return this.substring(0, prefix.length) === prefix;
    },
    endsWith(postfix) {
        return this.substring(this.length - postfix.length) === postfix;
    },
    repeat(count) {
        return new Array(count).join(this) + this;
    },
    includes() {
        'use strict';
        return ''.indexOf.apply(this, arguments) !== -1;
    }
});
