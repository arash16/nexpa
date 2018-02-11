var global = (0, eval)('this');

export function isNull(o) { return o === null; }
export function isUndefined(u) { return u === undefined; }
export function isVoid(x) { return x == null || !x && isNaN(x); }
// only voids: undefined, null, NaN

export function isBool(b) { return typeof b == 'boolean'; }
export function isString(s) { return typeof s == 'string'; }
export function isNumber(num) { return typeof num == 'number'; }

export function isFunc(f) { return typeof f == 'function' && f; }
export function isObject(o) { return typeof o == 'object' && o; }
export function isObjectLike(x) { return isFunc(x) || isObject(x); }
export function isValue(val) { return val ? !isObjectLike(val) : !isVoid(val); }

export function isArray(a) { return Array.isArray(a) && a; }

export function objToString(o) { return {}.toString.call(o); }
export function isDate(d) { return objToString(d) === '[object Date]' && d; }
export function isRegExp(re) { return objToString(re) === '[object RegExp]' && re; }
export function isPromiseLike(obj) { return isObjectLike(obj) && isFunc(obj.then); }
export function isError(e) { return e && (e instanceof Error || objToString(e) === '[object Error]'); }

export const isNaN = Number.isNaN || global.isNaN;
// --------------------------------------------------------------------------------------------------------

export function keys(obj) {
	if (Object.keys) return Object.keys(obj);
	var result = [];
	for (var p in obj)
		if (({}).hasOwnProperty.call(obj, p))
			result.push(p);
	return result;
}

export function hasProp(o, p) { return {}.hasOwnProperty.call(o, p); }
export function nullObject(proto, d) {
	return Object.create(proto || null, d);
}


var getObjectOwnKeys = Object.getOwnPropertyNames;
export function eachKey(obj, fn, nonEnums, noResult) {
    if (!isObjectLike(obj)) return !noResult && [];
    var keysFn = nonEnums ? getObjectOwnKeys : keys;
    return keysFn(obj)[noResult ? 'forEach' : 'map'](function(key) { return fn(key, obj[key]); });
}

export function extend(target) {
    var aLen = arguments.length,
        result = isObjectLike(target);

    for (var i = 1; i < aLen; i++)
        eachKey(arguments[i], function (p, val) {
            result = result || {};
            result[p] = val;
        }, false, true);
    return result;
}


export function defaults(target) {
    var aLen = arguments.length,
        result = isObjectLike(target);

    for (var i = 1; i < aLen; i++)
        eachKey(arguments[i], function (p, val) {
            result = result || {};
            if (isUndefined(result[p]))
                result[p] = val;
        });
    return result;
}

export function orDefault(o, d) { return isVoid(o) ? d : o; }
export function identity(x) { return x; }
export function nopFunc() { }
export function toArray(u) {
    return isArray(u) ? u : isVoid(u) ? [] : [u];
}

export function assert(condition, message) {
    // console.assert(condition, message, assert.caller);
    if (!condition)
        throw new Error('ASSERT: ' + (message || 'Error'));
}

// -------------------------------------------------------------------------

export function funcSelf(fn) {
    return function() {
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

// --------------------------------------------------------------------------

export function slice(a, s, e) {
    s = s | 0;
    if (!isVoid(e)) e = e | 0;
    if (s < 0) s += a.length;
    if (e < 0) e += a.length;

    return [].slice.call(a, s, e);
}

export function unique(arr) {
    var result = [];
    return _arrayUnique(toArray(arr));

    function _arrayUnique(arr) {
        for (var i = 0, len = arr.length, item; i < len; i++)
            if (!isVoid(item = arr[i]))
                if (isArray(item)) _arrayUnique(item);
                else if (result.indexOf(item) < 0)
                    result.push(item);

        return result;
    }
}

export function ArrayN(dim, init) {
    var d = isArray(dim) ? (dds = slice(dim, 1)) && dim[0] : dim,
        r = new Array(d),
        dds;

    for (var i = 0; i < d; i++)
        r[i] = dds ? ArrayN(dds, init) : init;

    return r;
}

// --------------------------------------------------------------------------------

export function mod(a, b) {
    var r = a % b;
    return r < 0 ? r + b : r;
}

export function bounded(x, minVal, maxVal) {
    return x < minVal ? minVal :
        x > maxVal ? maxVal : x;
}

var randomAlphas = 'abcdefghijklmnopqrstuvwxyz';
randomAlphas += randomAlphas.toUpperCase() + '0123456789';
export function random(len) {
    var res = '';
    for (var i = len || 10; i > 0; i--)
        res += randomAlphas[Math.random() * randomAlphas.length | 0];
    return res;
}

export function round(num, precision) {
    var p = Math.pow(10, precision | 0);
    return Math.round(num * p) / p;
}

// --------------------------------------------------------------------------------

export function isNexable(obj, type) {
    // W: writable
    // C: computed
    // S: struct
    // A: array

    if (isFunc(obj)) {
        var isNx = obj.isNexable;
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
    var r = parseInt(unwrap(num));
    return isNaN(r) && !isUndefined(d) ? d : r;
}

export function toFloat(num, d) {
    var r = parseFloat(unwrap(num));
    return isNaN(r) && !isUndefined(d) ? d : r;
}
