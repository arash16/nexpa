import { isUndefined, isFunc } from './is-x';

export function isNexable(obj, type) {
    // W: writable
    // C: computed
    // S: struct
    // A: array

    if (isFunc(obj)) {
        let isNx = obj.isNexable;
        if (isNx) return !type || isNx.indexOf(type) >= 0;
    }
    return false;
}

export function unwrap(nexableOrValue) {
    while (isNexable(nexableOrValue))
        nexableOrValue = nexableOrValue();

    return nexableOrValue;
}

export function ifThen(test, thenResult, elseResult) {
    return unwrap(test) ? unwrap(thenResult) : unwrap(elseResult);
}

export function toInteger(num, d) {
    let r = parseInt(unwrap(num));
    return isNaN(r) && !isUndefined(d) ? d : r;
}

export function toFloat(num, d) {
    let r = parseFloat(unwrap(num));
    return isNaN(r) && !isUndefined(d) ? d : r;
}
