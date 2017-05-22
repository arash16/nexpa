function isNexable(obj, type) {
    // W: writable
    // C: computed
    // S: struct
    // A: array

    if (isFunc(obj)) {
        var isNx = obj.isNexable;
        if (isNx) return !type || type.indexOf(isNx) >= 0;
    }
    return false;
}

function unwrap(nexableOrValue) {
    while (isNexable(nexableOrValue))
        nexableOrValue = nexableOrValue();

    return nexableOrValue;
}


function toInteger(num, d) {
    var r = parseInt(unwrap(num));
    return isNaN(r) && !isUndefined(d) ? d : r;
}

function toFloat(num, d) {
    var r = parseFloat(unwrap(num));
    return isNaN(r) && !isUndefined(d) ? d : r;
}
