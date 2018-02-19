import { ensureDomNode, getComputedStyles } from './utils'

var defStyles = 'position:absolute; left:-1000px; top:-1000px; width:auto; margin:0; padding:0;',
    requiredCss = [
        'font-size', 'font-style', 'font-weight', 'font-family',
        'line-height', 'text-transform', 'letter-spacing'
    ];

export function getContentWidth() {
    var node = ensureDomNode(this);
    if (!node) return 0;

    var content = tryStringify(node.value);
    if (isUndefined(content))
        content = tryStringify(node.textContent);

    if (!content) return 0;
    var styles = defStyles,
        cStyles = getComputedStyles(node);

    if (!cStyles) return content.length * 7;
    for (var i = 0, k; k = requiredCss[i]; i++)
        styles += k + ':' + cStyles.getPropertyValue(k) + ';'

    var dummyNode = document.createElement('div');
    dummyNode.style.cssText = styles;
    dummyNode.textContent = content;

    document.body.appendChild(dummyNode);
    var result = dummyNode.offsetWidth || dummyNode.clientWidth;
    document.body.removeChild(dummyNode);
    return result;
}
