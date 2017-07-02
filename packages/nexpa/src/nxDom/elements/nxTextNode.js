function nxTextNode(text) {
    var elem = this;
    elem.id = ++NX_ELEMENT_LAST_ID;
    elem.parent = nx();

    if (isNexable(text)) {
        elem.text = text;
        elem.render = nx(()=> {
            var result = document.createTextNode('');
            nx.run(function () {
                var val = unwrap(elem.text);
                result.textContent = isVoid(val) ? '' : String(val);
            });
            return result;
        });
    }

    else {
        elem.text = isVoid(text) ? '' : String(text);
        elem.render = nx(() => document.createTextNode(elem.text));
    }
}

nxTextNode.prototype = rawObject({
    isEqualTo: function (other) {
        if (other instanceof nxTextNode)
            return this.text === other.text;

        if (isValue(other)) other = String(other);
        if (isNexable(this.text) || isString(other))
            return this.text === other;
    }
});
