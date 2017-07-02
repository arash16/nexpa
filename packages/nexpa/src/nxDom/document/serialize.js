var serializeElement = (function () {
    return function (elem) {
        var strings = [];

        var tagname = elem.tagName;

        if (elem.namespaceURI === "http://www.w3.org/1999/xhtml")
            tagname = tagname.toLowerCase();

        strings.push("<" + tagname + properties(elem) + datasetify(elem) + ">");

        if (elem.textContent)
            strings.push(elem.textContent);

        elem.childNodes.forEach(function (node) {
            strings.push(node.toString());
        });

        strings.push("</" + tagname + ">");

        return strings.join("");
    };

    function isProperty(elem, key) {
        var type = typeof elem[key];

        if (key === "style" && Object.keys(elem.style).length > 0)
            return true;

        return elem.hasOwnProperty(key) &&
            (type === "string" || type === "boolean" || type === "number") &&
            key !== "nodeName" && key !== "className" && key !== "tagName" &&
            key !== "textContent" && key !== "namespaceURI";
    }

    function stylify(styles) {
        var attr = "";
        Object.keys(styles).forEach(function (key) {
            var value = styles[key];
            attr += key + ":" + value + ";";
        });
        return attr;
    }

    function datasetify(elem) {
        var ds = elem.dataset;
        var props = [];

        eachKey(ds, function (key, val) {
            props.push({ name: "data-" + key, value: val });
        });

        return props.length ? stringify(props) : "";
    }

    function stringify(list) {
        var attributes = [];
        list.forEach(function (tuple) {
            var name = tuple.name;
            var value = tuple.value;

            if (name === "style")
                value = value instanceof CSSProperties ? value.toString() : stylify(value);

            attributes.push(name + "=" + "\"" + value + "\"");
        });

        return attributes.length ? " " + attributes.join(" ") : "";
    }

    function properties(elem) {
        var props = [];
        eachKey(elem, function (key, value) {
            if (isProperty(elem, key))
                props.push({ name: key, value: value });
        });

        eachKey(elem._attributes, function (ns, nsAttr) {
            eachKey(nsAttr, function (attribute, value) {
                var name = (ns !== "null" ? ns + ":" : "") + attribute;

                props.push({
                    name: name,
                    value: value
                });
            });
        })

        if (elem.className)
            props.push({ name: "class", value: elem.className });

        return props.length ? stringify(props) : "";
    }
})();
