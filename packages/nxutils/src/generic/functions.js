function funcSelf(fn) { return () => fn.call.apply(fn, arguments); }

function constFunc(x) {
    return !isValue(x) ? resultFn : constFunc[x] = constFunc[x] || resultFn;
    function resultFn() { return x; }
}

function stopPropagation(e, preventDefault) {
    e.stopPropagation();
    if (preventDefault)
        e.preventDefault();
    return false;
}

function ifThen(test, thenResult, elseResult) {
    return unwrap(test) ? unwrap(thenResult) : unwrap(elseResult);
}

function ifUndefined(target, result) {
    return isUndefined(target) ? result : target
}
