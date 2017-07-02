/* Hex to RGB conversion. Copyright Tim Down: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */

var __reHexShortForm = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    __reHexLongForm = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

function hexToRgb(hexx) {
    var hex = hex.replace(__reHexShortForm, function (m, r, g, b) {
            return r + r + g + g + b + b;
        }),
        rgbParts = __reHexLongForm.exec(hex);
    return rgbParts ? [parseInt(rgbParts[1], 16), parseInt(rgbParts[2], 16), parseInt(rgbParts[3], 16)] : [0, 0, 0];
}
