function ensureDomNode(elem, ensureAttached) {
    if (!elem) return;
    var result;

    if (elem instanceof nxElement)
        result = elem.getNode();

    else if (elem && isNumber(elem.nodeType))
        result = elem;

    if (!result || !ensureAttached || document.contains(result))
        return result;
}


function getComputedStyles(elem, ensureAttached) {
    var node = ensureDomNode(elem, ensureAttached);
    if (!node) return;

    return global.getComputedStyle ?
           global.getComputedStyle(node, null) :
           node.currentStyle || node.style;
}


var __reInlineTagNames = /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|q|samp|script|select|small|span|strong|sub|sup|textarea|tt|var)$/,
    __reTagNameDisplayTypes = {
        'table': 'table',
        'tbody': 'table-row-group',
        'tr': 'table-row',
        'li': 'list-item'
    };

function getDisplayType(elem) {
    var node = ensureDomNode(elem);
    if (!node) return;

    var tagName = tryStringify(node.tagName).toLowerCase();
    return __reInlineTagNames.test(tagName) ? 'inline' :
           __reTagNameDisplayTypes[tagName] || 'block';
}


var reRoundCssParser = /(^|[^0-9a-z.])([+-]?[0-9]+(?:\.[0-9]+)?)(px|%|ms|s|em|pt|deg|rad|rem|vw|vh)?/g;
function roundCssValue(cssVal) {
    var val = tryStringify(cssVal);
    if (!val) return '';

    return val.replace(reRoundCssParser, (a, s, x, unit)
        => s + (+x * 100 | 0) / 100 + (unit || ''));
}
