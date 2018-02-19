import { ensureDomNode } from './utils'

export function getViewportOffsets() {
    var node = ensureDomNode(this, true);
    if (!node) return;

    var xPosition = 0,
        yPosition = 0;

    while (node) {
        xPosition += node.offsetLeft - node.scrollLeft + node.clientLeft;
        yPosition += node.offsetTop - node.scrollTop + node.clientTop;
        node = node.offsetParent;
    }

    return rectOffsetSize({
        top: yPosition,
        left: xPosition
    });
}

export function getAbsoluteOffsets() {
    var node = ensureDomNode(this, true);
    if (!node) return;

    var rect = node.getBoundingClientRect();
    return rectOffsetSize({
        top: rect.top + spa.window.scrollY(),
        left: rect.left + +spa.window.scrollX(),
        width: rect.width,
        height: rect.height
    });
}

export function getOffsetSizes() {
    var node = ensureDomNode(this, true);
    if (!node) return;

    return rectOffsetSize({
        width: node.offsetWidth,
        height: node.offsetHeight
    });
}


function rectOffsetSize(obj) {
    var result;
    ['top', 'left', 'width', 'height'].forEach(function (p) {
        var v = parseFloat(obj[p]);
        if (!isNaN(v)) {
            result = result || { isEqualTo: rectsEquality };
            result[p] = v;
        }
    });
    return result;
}

function rectsEquality(other) {
    if (!isObject(other))
        return false;

    if (!isUndefined(this.top))
        if (this.top !== other.top || this.left !== other.left)
            return false;

    if (!isUndefined(this.width))
        if (this.width !== other.width || this.height !== other.height)
            return false;

    return true;
}
