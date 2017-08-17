var global = (0,eval)('this'),
    String = global.String,
    Number = global.Number,
    Boolean = global.Boolean,
    Function = global.Function,
    Object = global.Object,
    RegExp = global.RegExp,
    Array = global.Array,
    Error = global.Error,
    Date = global.Date,
    Symbol = global.Symbol,
    ArrayBuffer = global.ArrayBuffer;

var defineProp = Object.defineProperty,
    defineProps = Object.defineProperties,
    getObjectOwnKeys = Object.getOwnPropertyNames,
    getObjectKeys = Object.keys;

function hasProp(o, p) { return {}.hasOwnProperty.call(o, p); }
function nullObject(proto, d) { return Object.create(proto || null, d); }

import "./is-x";

function orDefault(o, d) { return isVoid(o) ? d : o; }
function identity(x) { return x; }
function nopFunc() { }


function eachKey(obj, fn, nonEnums, noResult) {
    if (!isObjectLike(obj)) return !noResult && [];
    var keysFn = nonEnums ? getObjectOwnKeys : getObjectKeys;
    return keysFn(obj)[noResult ? 'forEach' : 'map'](key => fn(key, obj[key]));
}

function extend(target) {
    var aLen = arguments.length,
        result = isObjectLike(target);

    for (var i = 1; i < aLen; i++)
        eachKey(arguments[i], function (p, val) {
            result = result || {};
            result[p] = val;
        }, false, true);
    return result;
}

function toArray(u) {
    return isArray(u) ? u : isVoid(u) ? [] : [u];
}

function applyShim(obj, property, value) {
    if (arguments.length < 3)
        eachKey(property, (p, v) => applyShim(obj, p, v));

    else if (isObjectLike(obj) && !hasProp(obj, property))
        defineProp(obj, property, {
            enumerable: true,
            value: value
        });

    return obj;
}

function assert(condition, message) {
    console.assert(condition, message, assert.caller);
    if (!condition)
        throw new Error('ASSERT: ' + (message || 'Error'));
}
