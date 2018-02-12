import "./is-x";

function funcSelf(fn) { return () => fn.call.apply(fn, arguments); }

function constFunc(x) {
    return !isValue(x) ? resultFn : constFunc[x] = constFunc[x] || resultFn;
    function resultFn() { return x; }
}

function ifUndefined(target, result) {
    return isUndefined(target) ? result : target
}
