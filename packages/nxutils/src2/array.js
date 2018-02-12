import { isVoid, isArray } from './is-x'

export function toArray(u) {
    return isArray(u) ? u : isVoid(u) ? [] : [u];
}

export function slice(a, s, e) {
    s = s | 0;
    if (!isVoid(e)) e = e | 0;
    if (s < 0) s += a.length;
    if (e < 0) e += a.length;

    return [].slice.call(a, s, e);
}

export function unique(arr) {
    let result = [];
    return _arrayUnique(toArray(arr));

    function _arrayUnique(arr) {
        for (let i = 0, len = arr.length, item; i < len; i++)
            if (!isVoid(item = arr[i]))
                if (isArray(item)) _arrayUnique(item);
                else if (result.indexOf(item) < 0)
                    result.push(item);

        return result;
    }
}

export function ArrayN(dim, init) {
    let d = isArray(dim) ? (dds = slice(dim, 1)) && dim[0] : dim,
        r = new Array(d),
        dds;

    for (let i = 0; i < d; i++)
        r[i] = dds ? ArrayN(dds, init) : init;

    return r;
}
