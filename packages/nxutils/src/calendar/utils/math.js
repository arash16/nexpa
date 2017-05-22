function dtr(d) {
    return d * PI / 180.0;
}

function rtd(r) {
    return r * 180.0 / PI;
}


function fixAngle(a) {
    return a - 360.0 * floor(a / 360.0);
}


function fixAngr(a) {
    return a - 2 * PI * floor(a / (2 * PI));
}


function dSin(d) {
    return sin(dtr(d));
}


function dCos(d) {
    return cos(dtr(d));
}


function mod(a, b) {
    return a - b * floor(a / b);
}


function aMod(a, b) {
    return mod(a - 1, b) + 1;
}
