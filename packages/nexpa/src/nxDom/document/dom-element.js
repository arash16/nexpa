var DOMElement = (function () {
    import "event/dispatch-event";
    import "event/add-event-listener";
    import "event/remove-event-listener";
    import "serialize.js";

    var htmlns = "http://www.w3.org/1999/xhtml";

    function DOMElement(tagName, owner, namespace) {
        var ns = namespace === undefined ? htmlns : (namespace || null);

        this.tagName = ns === htmlns ? String(tagName).toUpperCase() : tagName;
        this.className = "";
        this.dataset = {};
        this.childNodes = [];
        this.parentNode = null;
        this.style = new CSSProperties();
        this.ownerDocument = owner || null;
        this.namespaceURI = ns;
        this._attributes = {};

        if (this.tagName === 'INPUT')
            this.type = 'text';
    }

    DOMElement.prototype = rawObject({
        type: "DOMElement",
        nodeType: 1,

        appendChild: function (child) {
            if (child.parentNode)
                child.parentNode.removeChild(child);

            this.childNodes.push(child);
            child.parentNode = this;

            return child;
        },

        replaceChild: function (elem, needle) {
            // TODO: Throw NotFoundError if needle.parentNode !== this

            if (elem.parentNode)
                elem.parentNode.removeChild(elem);

            elem.parentNode = this;
            needle.parentNode = null;
            this.childNodes[this.childNodes.indexOf(needle)] = elem;

            return needle;
        },

        removeChild: function (elem) {
            // TODO: Throw NotFoundError if elem.parentNode !== this

            this.childNodes.splice(this.childNodes.indexOf(elem), 1);
            elem.parentNode = null;
            return elem;
        },

        insertBefore: function (elem, needle) {
            // TODO: Throw NotFoundError if referenceElement is a dom node
            // and parentNode !== this

            if (elem.parentNode)
                elem.parentNode.removeChild(elem);

            var index = needle === null || needle === undefined ? -1 :
                        this.childNodes.indexOf(needle);

            if (index > -1)
                this.childNodes.splice(index, 0, elem);
            else
                this.childNodes.push(elem);

            elem.parentNode = this;
            return elem;
        },

        setAttributeNS: function (namespace, name, value) {
            var colonPosition = name.indexOf(":"),
                localName = colonPosition > -1 ? name.substr(colonPosition + 1) : name,
                attributes = this._attributes[namespace] || (this._attributes[namespace] = {});
            attributes[localName] = value;
        },

        getAttributeNS: function (namespace, name) {
            var attributes = this._attributes[namespace];
            if (!attributes || !isString(attributes[name]))
                return null;

            return attributes[name];
        },

        removeAttributeNS: function (namespace, name) {
            var attributes = this._attributes[namespace];
            if (attributes)
                delete attributes[name];
        },

        setAttribute: function (name, value) {
            return this.setAttributeNS(null, name, value);
        },

        getAttribute: function (name) {
            return this.getAttributeNS(null, name);
        },

        removeAttribute: function (name) {
            return this.removeAttributeNS(null, name);
        },

        removeEventListener: removeEventListener,
        addEventListener: addEventListener,
        dispatchEvent: dispatchEvent,

        // Un-implemented
        focus: function () {
            return void 0;
        },

        toString: function () {
            return serializeElement(this);
        },

        getElementsByClassName: function (classNames) {
            return this.ownerDocument.getElementsByClassName(classNames, this);
        }
    });

    return DOMElement;
})();
