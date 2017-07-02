function DocumentFragment(owner) {
    this.childNodes = [];
    this.parentNode = null;
    this.ownerDocument = owner || null;
}

DocumentFragment.prototype = rawObject({
    type: "DocumentFragment",
    nodeName: "#document-fragment",
    nodeType: 11,

    appendChild: DOMElement.prototype.appendChild,
    replaceChild: DOMElement.prototype.replaceChild,
    removeChild: DOMElement.prototype.removeChild,

    toString: function () {
        return this.childNodes.join('');
    }
});
