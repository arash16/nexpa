import "./base";

var fromCharCode = String.fromCharCode,
    reObjectProtoToStr = /^\[object [a-zA-Z$_][a-zA-Z$_0-9]*\]$/;

function tryStringify(inp, def) {
    var o = unwrap ? unwrap(inp) : inp;
    if (isVoid(o)) return def;
    if (isValue(o)) return String(o);

    if (isFunc(o.toString)) {
        var str = o.toString();
        if (!isVoid(str) && !reObjectProtoToStr.test(str))
            return String(str);
    }

    if (isFunc(o.valueOf)) {
        var oo = o.valueOf();
        if (oo !== o) return tryStringify(oo, def);
    }

    return def;
}


var reStrFormatPlaceholder = /\$([a-z0-9_]+)/gi;
function format(s, vars) {
    return s.replace(reStrFormatPlaceholder, function (x, y) { return vars[y]; });
}


var reMakeValueIdentifier = /([^a-zA-Z0-9_]+)([a-z]?)/g;
function toValidIdentifier(str) {
    return str.replace(reMakeValueIdentifier, function (i, x, y) {
        return y && x.length < 2 ? y.toUpperCase() : '_' + y;
    });
}


var reCamelCaseStr = /(^|\-)([a-z])/gi;
function camelCase(str) {
    return str.replace(reCamelCaseStr, function (s, x, y) {
        return x ? y.toUpperCase() : y.toLowerCase();
    });
}

applyShim(String.prototype, {
    'startsWith': function (prefix) {
        return this.substring(0, prefix.length) === prefix;
    },
    'endsWith': function (postfix) {
        return this.substring(this.length - postfix.length) === postfix;
    },
    'repeat': function (count) {
        return new Array(count).join(this) + this;
    },
    'includes': function () {
        'use strict';
        return ''.indexOf.apply(this, arguments) !== -1;
    },
    'codePointAt': function (position) {
        var string = String(this),
            size = string.length,
            index = position | 0;

        if (index < 0 || index >= size)
            return undefined;

        var first = string.charCodeAt(index);
        if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
            var second = string.charCodeAt(index + 1);
            if (second >= 0xDC00 && second <= 0xDFFF) // low surrogate
                return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
        return first;
    }
});

applyShim(String, 'fromCodePoint', function () {
    var length = arguments.length;
    if (!length) return '';

    var MAX_SIZE = 0x4000,
        codeUnits = [],
        index = -1;

    var result = '';
    while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint)
            throw RangeError('Invalid code point: ' + codePoint);

        if (codePoint <= 0xFFFF)
            codeUnits.push(codePoint);

        else {
            codePoint -= 0x10000;
            codeUnits.push((codePoint >> 10) + 0xD800, (codePoint % 0x400) + 0xDC00);
        }

        if (index + 1 == length || codeUnits.length > MAX_SIZE) {
            result += fromCharCode.apply(null, codeUnits);
            codeUnits.length = 0;
        }
    }
    return result;
});
