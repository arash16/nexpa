var vendorStyleProperty = (function () {
    var divEl = document.createElement('div'),
        vendors = ["Webkit", "Moz", "ms", "O"],
        cache = nullObject();

    return function (property, el) {
        if (property in cache)
            return cache[property];

        var p = camelCase(property);
        if (p in cache) return cache[property] = cache[p];

        var tStyle = (el || divEl).style;
        if (isString(tStyle[p]))
            return cache[property] = cache[p] = p;

        var p3 = p[0].toUpperCase() + p.substr(1);
        for (var i = 0, v; v = vendors[i]; i++)
            if (isString(tStyle[v + p3]))
                return cache[property] = cache[p] = cache[v + p3] = v + p3;

        return cache[property] = cache[p] = '';
    }
})();

var vendorStyleProperties = (function () {
    var reSplit = /[^a-z-]+/gi,
        cache = nullObject();

    return function (property) {
        if (property && cache[property.id])
            return cache[property.id];

        var id = tryStringify(property);
        if (hasProp(cache, id)) return cache[id];

        var props = isArray(property) ? property : property.split(reSplit);
        for (var i = 0, j = 0; i < props.length; i++) {
            var vp = vendorStyleProperty(props[i].trim());
            if (vp) props[j++] = vp;
        }

        if (j > 1) {
            props.length = j;
            return cache[props.id = id] = props;
        }

        return cache[id] = j ? props[0] : undefined;
    };
})();
