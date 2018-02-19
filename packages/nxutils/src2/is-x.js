export const global = function() { return eval; }()('this');

export function isNull(o) { return o === null; }
export function isUndefined(u) { return u === undefined; }
export function isVoid(x) { return x == null || !x && isNaN(x); }
// only voids: undefined, null, NaN

export function isBool(b) { return typeof b === 'boolean'; }
export function isString(s) { return typeof s === 'string'; }
export function isNumber(num) { return typeof num === 'number'; }

export function isFunc(f) { return typeof f === 'function' && f; }
export function isObject(o) { return typeof o === 'object' && o; }
export function isObjectLike(x) { return isFunc(x) || isObject(x); }
export function isValue(val) { return val ? !isObjectLike(val) : !isVoid(val); }

export function isArray(a) { return Array.isArray(a) && a; }

export function objToString(o) { return {}.toString.call(o); }
export function isDate(d) { return objToString(d) === '[object Date]' && d; }
export function isRegExp(re) { return objToString(re) === '[object RegExp]' && re; }
export function isPromiseLike(obj) { return isObjectLike(obj) && isFunc(obj.then); }
export function isError(e) { return e && (e instanceof Error || objToString(e) === '[object Error]'); }

export const isNaN = Number.isNaN || global.isNaN;

/*
import {
    isNull, isUndefined, isVoid, isBool, isString, isNumber, isFunc, isObject, isObjectLike, isValue, isArray, isNaN,
    objToString, isDate, isRegExp, isError
} from './is-x';
*/
