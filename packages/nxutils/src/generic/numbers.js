function mod(a, b) {
    var r = a % b;
    return r < 0 ? r + b : r;
}

var parseFloat = Number.parseFloat || global.parseFloat,
    parseInt = Number.parseInt || global.parseInt,
    isNaN = Number.isNaN || global.isNaN,
    Math2 = global.Math,
    pow = Math2.pow,
    abs = Math2.abs,
    max = Math2.max,
    min = Math2.min,
    ceil = Math2.ceil,
    floor = Math2.floor,
    isFinite = Number.isFinite || (val => typeof val == 'number' && global.isFinite(val)),
    PI = Math2.PI,
    sqrt = Math2.sqrt,
    sin = Math2.sin,
    cos = Math2.cos,
    tan = Math2.tan,
    atan2 = Math2.atan2,
    asin = Math2.asin;

function bounded(x, minVal, maxVal) {
    return x < minVal ? minVal :
        x > maxVal ? maxVal : x;
}

var __randomAlphas = 'abcdefghijklmnopqrstuvwxyz';
__randomAlphas = __randomAlphas + __randomAlphas.toUpperCase() + '0123456789';
function random(len) {
    var res = '';
    for (var i = len || 10; i > 0; i--)
        res += __randomAlphas[Math2.random() * __randomAlphas.length | 0];
    return res;
}

function round(num, precision) {
    var p = pow(10, precision | 0);
    return Math2.round(num * p) / p;
}
