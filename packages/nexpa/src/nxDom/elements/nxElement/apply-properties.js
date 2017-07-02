function applyProperties(proxy, props) {
    var cl = props.class || props['class'] || props.className;
    if (cl) nx.run(function () {
        proxy.setClasses(parseClasses(cl));
    });

    eachKey(props, function (propName, propValue) {
        if (!isUndefined(propValue) && propName != 'class' && propName != 'className') {
            var currentValue;
            nx.run(function () {
                var oldVal = currentValue;
                currentValue = unwrap(propValue);
                if (oldVal !== currentValue)
                    propertyPatcher(proxy, propName, currentValue, oldVal);
            });
        }
    });
}

// ----------------------------------------------------------------------------------------------

function _classIfPropValue(p, val) {
    return unwrap(val) && p;
}

function parseClasses(ncl) {
    var cl = unwrap(ncl);

    if (isString(cl))
        return cl.trim();

    if (isArray(cl)) {
        var r = [];
        for (var i = 0; i < cl.length; i++) {
            var el = parseClasses(cl[i]);
            if (el && r.indexOf(el) < 0)
                r.push(el);
        }
        return r.join(' ');
    }

    if (isObject(cl))
        return eachKey(cl, _classIfPropValue)
            .filter(identity)
            .join(' ');
}

// ----------------------------------------------------------------------------------------------

function propertyPatcher(node, propName, propValue, previous) {
    if (isUndefined(propValue))
        removeProperty(node, propName, previous);

    else if (isObject(propValue))
        patchObject(node, propName, propValue, previous);

    else node.setProp(propName, propValue);
}

// ----------------------------------------------------------------------------------------------

function removeProperty(node, propName, previous) {
    if (previous) {
        if (propName == 'attributes')
            eachKey(previous, key => node.setAttr(key));

        else if (propName == 'style')
            eachKey(previous, key => node.setStyle(key));

        else node.setProp(propName, isString(previous) ? '' : null);
    }
}

// ----------------------------------------------------------------------------------------------

function patchObject(node, propName, propValue, previous) {
    var pre = isObject(previous) || undefined;

    if (propName == 'attributes') {
        eachKey(pre, function (key, val) {
            if (val && !(key in pre))
                node.setAttr(key);
        });

        eachKey(propValue, function (key, val) {
            var currentValue = pre && pre[key];
            nx.run(function () {
                var oldValue = currentValue;
                currentValue = unwrap(val);
                if (currentValue !== oldValue)
                    node.setAttr(key, currentValue, oldValue);
            });
        });
    }

    else if (propName == 'style') {
        eachKey(pre, function (key, val) {
            if (val && !(key in propValue))
                node.setStyle(key);
        });

        eachKey(propValue, function (key, val) {
            var currentValue = pre && pre[key];
            nx.run(function () {
                var oldValue = currentValue;
                currentValue = unwrap(val);
                if (currentValue !== oldValue)
                    node.setStyle(key, currentValue, oldValue);
            });
        });
    }

    else node.setProp(propName, propValue);
}

