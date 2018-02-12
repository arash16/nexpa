function isNull(o) { return o === null; }
function isUndefined(u) { return u === undefined; }
function isVoid(x) { return x == null || !x && isNaN(x); }
// only voids: undefined, null, NaN

function isBool(b) { return typeof b == 'boolean'; }
function isString(s) { return typeof s == 'string'; }
function isNumber(num) { return typeof num == 'number'; }

function isFunc(f) { return typeof f == 'function' && f; }
function isObject(o) { return typeof o == 'object' && o; }
function isObjectLike(x) { return isFunc(x) || isObject(x); }
function isValue(val) { return val ? !isObjectLike(val) : !isVoid(val); }

function isArray(a) { return Array.isArray(a) && a; }

function objToString(o) { return {}.toString.call(o); }
function isDate(d) { return objToString(d) === '[object Date]' && d; }
function isRegExp(re) { return objToString(re) === '[object RegExp]' && re; }
function isPromiseLike(obj) { return isObjectLike(obj) && isFunc(obj.then); }
function isError(e) { return e && (e instanceof Error || objToString(e) === '[object Error]'); }
