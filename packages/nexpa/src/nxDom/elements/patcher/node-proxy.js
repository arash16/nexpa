function DomNodeProxy(element, node) {
    var that = this;
    that._domNode = node;
    that._element = element;
    that._childsPatcher = undefined;
}

DomNodeProxy.prototype = rawObject({
    childsPatcher: function (newItems) {
        var oldPatcher = this._childsPatcher,
            newPatcher = new ChildsPatcher(this, newItems, oldPatcher);

        return this._childsPatcher = newPatcher;
    },
    setProp: function (propName, propValue) {
        var node = this._domNode;
        if (propName) node[propName] = propValue;
    },
    setAttr: function (key, value) {
        var node = this._domNode;
        if (key) {
            if (isUndefined(value))
                node.removeAttribute(key);
            else node.setAttribute(key, value);
        }
    },
    setClasses: function (val) {
        if (isArray(val)) val = val.join(' ');
        this.setProp('className', val || '');
    },
    setStyle: function (key, val) {
        var node = this._domNode;
        key = vendorStyleProperty(key, node);
        if (key) {
            if (!isUndefined(val))
                node.style.setProperty(key, val);
            else node.style.removeProperty(key);
            node.style[key] = isVoid(val) ? '' : val;
        }
    },
    getStyle: function (key) {
        var node = this._domNode,
            vKey = vendorStyleProperty(key, node);
        if (vKey) return node.style[vKey];
    }
});
