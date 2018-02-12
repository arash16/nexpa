import { isUndefined, isObjectLike } from './is-x';

let hop = {}.hasOwnProperty;
export function keys(obj) {
    if (Object.keys) return Object.keys(obj);
    let result = [];
    for (let p in obj)
        if (hop.call(obj, p))
            result.push(p);
    return result;
}

export const hasProp = (o, p) => hop.call(o, p);

export function nullObject(proto, d) {
    return Object.create(proto || null, d);
}

let getObjectOwnKeys = Object.getOwnPropertyNames;
export function eachKey(obj, fn, nonEnums, noResult) {
    if (!isObjectLike(obj)) return !noResult && [];
    let keysFn = nonEnums ? getObjectOwnKeys : keys;
    return keysFn(obj)[noResult ? 'forEach' : 'map'](key => fn(key, obj[key]));
}

export function extend(target) {
    let aLen = arguments.length,
        result = isObjectLike(target);

    for (let i = 1; i < aLen; i++)
        eachKey(arguments[i], function (p, val) {
            result = result || {};
            result[p] = val;
        }, false, true);
    return result;
}

export function defaults(target) {
    let aLen = arguments.length,
        result = isObjectLike(target);

    for (let i = 1; i < aLen; i++)
        eachKey(arguments[i], function (p, val) {
            result = result || {};
            if (isUndefined(result[p]))
                result[p] = val;
        });
    return result;
}
