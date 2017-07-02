function DOMText(value, owner) {
    this.data = value || "";
    this.length = this.data.length;
    this.ownerDocument = owner || null;
}

DOMText.prototype = rawObject({
    type: "DOMTextNode",
    nodeType: 3,

    toString: function () {
        return this.data;
    },

    replaceData: function (index, length, value) {
        var current = this.data,
            left = current.substring(0, index),
            right = current.substring(index + length, current.length);

        this.data = left + value + right;
        this.length = this.data.length;
    }
});
