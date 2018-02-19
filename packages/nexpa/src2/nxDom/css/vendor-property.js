import { nullObject, camelCase, isString, isArray, hasProp } from 'nxutils';

let divEl = document.createElement('div'),
    vendors = ["Webkit", "Moz", "ms", "O"],
    cache = nullObject();

export function vendorStyleProperty(property, el) {
    if (property in cache)
        return cache[property];

    let p = camelCase(property);
    if (p in cache) return cache[property] = cache[p];

    let tStyle = (el || divEl).style;
    if (isString(tStyle[p]))
        return cache[property] = cache[p] = p;

    let p3 = p[0].toUpperCase() + p.substr(1);
    for (let i = 0, v; v = vendors[i]; i++)
        if (isString(tStyle[v + p3]))
            return cache[property] = cache[p] = cache[v + p3] = v + p3;

    return cache[property] = cache[p] = '';
}


let reSplit = /[^a-z-]+/gi,
    cacheProps = nullObject();

export function vendorStyleProperties(property) {
    if (property && cacheProps[property.id])
        return cacheProps[property.id];

    let id = tryStringify(property);
    if (hasProp(cacheProps, id)) return cacheProps[id];

    let props = isArray(property) ? property : property.split(reSplit), j = 0;
    for (let i = 0; i < props.length; i++) {
        let vp = vendorStyleProperty(props[i].trim());
        if (vp) props[j++] = vp;
    }

    if (j > 1) {
        props.length = j;
        return cacheProps[props.id = id] = props;
    }

    return cacheProps[id] = j ? props[0] : undefined;
}
