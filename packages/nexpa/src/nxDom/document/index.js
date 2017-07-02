if ("isClient") {
    var document = global.document;
}
else {
    var Document = (function () {
        import "dom-walk";
        import "dom-text";
        import "dom-element";
        import "dom-fragment";
        import "style";
        import "event";

        function Document() {
            this.body = this.createElement("body");
            this.documentElement = this.createElement("html");
            this.documentElement.appendChild(this.body);
        }

        Document.prototype = rawObject({
            createTextNode: function (value) {
                return new DOMText(value, this);
            },

            createElementNS: function (namespace, tagName) {
                var ns = namespace === null ? null : String(namespace);
                return new DOMElement(tagName, this, ns);
            },

            createElement: function (tagName) {
                return new DOMElement(tagName, this);
            },

            createDocumentFragment: function () {
                return new DocumentFragment(this);
            },

            createEvent: function (family) {
                return new Event(family);
            },

            getElementById: function (id, parent) {
                if (!parent) parent = this.body;
                if (String(parent.id) === String(id))return parent;

                var arr = parent.childNodes,
                    result = null;

                if (!arr) return result;

                for (var i = 0, len = arr.length; !result && i < len; i++)
                    result = getElementById(id, arr[i]);

                return result;
            },

            getElementsByClassName: function (classNames, parent) {
                var classes = classNames.split(" "), elems = [];

                domWalk(parent || this.body, function (node) {
                    var nodeClassName = node.className || "",
                        nodeClasses = nodeClassName.split(" ");

                    if (classes.every(function (item) { return nodeClasses.indexOf(item) !== -1 }))
                        elems.push(node);
                });

                return elems;
            }
        });

        return Document;
    })();

    var document = new Document();
}
