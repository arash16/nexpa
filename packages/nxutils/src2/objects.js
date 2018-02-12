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


export function deepClone(obj) {
    let res = _deepClone(obj),
        ID_FIELD = '__^*',
        lastId = 0,
        fin = [],
        cls = {};
    fin.forEach(function (o) { delete o[ID_FIELD]; });
    return res;

    function _deepClone(obj) {
        if (isObject(obj)) {
            if (!isArray(obj)) {
                if (obj instanceof Object || isPromiseLike(obj) || isFunc(obj.constructor))
                    return obj;
            }

            let id = obj[ID_FIELD];
            if (id && cls[id] && cls[id].in === obj) {
                if (cls[id].out) return cls[id].out;

                // circular reference from prototype property to object
                return cls[id].out = {};
            }

            id = obj[ID_FIELD] = ++lastId;
            cls[id] = { in: obj };
            fin.push(obj);

            if (isArray(obj)) {
                let res = cls[id].out = [];

                for (let i = 0; i < obj.length; i++)
                    res[i] = _deepClone(obj[i]);

                return res;
            }

            // Object.keys -> enumerable
            // Object.getOwnPropertyNames -> non-enumerable

            let props = Object.getOwnPropertyNames(obj),
                proto = _deepClone(Object.getPrototypeOf(obj)),
                res;

            if (cls[id].out) Object.setPrototypeOf(res = cls[id].out, proto);
            else res = cls[id].out = Object.create(proto);

            for (let i = 0, p; p = props[i]; i++)
                if (p !== ID_FIELD)
                    res[p] = _deepClone(obj[p]);

            return res;
        }

        return obj;
    }
}
