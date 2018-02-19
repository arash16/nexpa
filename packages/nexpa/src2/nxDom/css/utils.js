export function ensureDomNode(elem, ensureAttached) {
    if (!elem) return;
    let result;

    if (elem instanceof nxElement)
        result = elem.getNode();

    else if (elem && isNumber(elem.nodeType))
        result = elem;

    if (!result || !ensureAttached || document.contains(result))
        return result;
}


export function getComputedStyles(elem, ensureAttached) {
    let node = ensureDomNode(elem, ensureAttached);
    if (!node) return;

    return global.getComputedStyle ?
           global.getComputedStyle(node, null) :
           node.currentStyle || node.style;
}


let reInlineTagNames = /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|q|samp|script|select|small|span|strong|sub|sup|textarea|tt|var)$/,
    reTagNameDisplayTypes = {
        'table': 'table',
        'tbody': 'table-row-group',
        'tr': 'table-row',
        'li': 'list-item'
    };

export function getDisplayType(elem) {
    let node = ensureDomNode(elem);
    if (!node) return;

    let tagName = tryStringify(node.tagName).toLowerCase();
    return reInlineTagNames.test(tagName) ? 'inline' :
           reTagNameDisplayTypes[tagName] || 'block';
}


let reRoundCssParser = /(^|[^0-9a-z.])([+-]?[0-9]+(?:\.[0-9]+)?)(px|%|ms|s|em|pt|deg|rad|rem|vw|vh)?/g;
export function roundCssValue(cssVal) {
    let val = tryStringify(cssVal);
    if (!val) return '';

    return val.replace(reRoundCssParser,
    	(a, s, x, unit) => s + (+x * 100 | 0) / 100 + (unit || '')
	);
}
