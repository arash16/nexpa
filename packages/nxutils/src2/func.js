import { isUndefined, isVoid, isValue } from './is-x';

export function orDefault(o, d) { return isVoid(o) ? d : o; }
export function identity(x) { return x; }
export function nopFunc() { }

export function funcSelf(fn) {
    return function () {
        return fn.call.apply(fn, arguments);
    }
}

export function constFunc(x) {
    return !isValue(x) ? resultFn : constFunc[x] = constFunc[x] || resultFn;
    function resultFn() { return x; }
}

export function ifUndefined(target, result) {
    return isUndefined(target) ? result : target
}

export function assert(condition, message) {
    // console.assert(condition, message, assert.caller);
    if (!condition)
        throw new Error('ASSERT: ' + (message || 'Error'));
}
