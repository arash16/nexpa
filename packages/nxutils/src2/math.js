export function mod(a, b) {
    let r = a % b;
    return r < 0 ? r + b : r;
}

export function bounded(x, minVal, maxVal) {
    return x < minVal ? minVal : x > maxVal ? maxVal : x;
}

let randomAlphas = 'abcdefghijklmnopqrstuvwxyz';
randomAlphas += randomAlphas.toUpperCase() + '0123456789';
export function random(len) {
    let res = '';
    for (let i = len || 10; i > 0; i--)
        res += randomAlphas[Math.random() * randomAlphas.length | 0];
    return res;
}

export function round(num, precision) {
    let p = Math.pow(10, precision | 0);
    return Math.round(num * p) / p;
}
