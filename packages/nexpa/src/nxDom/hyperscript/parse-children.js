function parseChildren(children, custom) {
    var nxItems = [],
        result = children ? parse(children, custom, nxItems) : [];

    if (nxItems.length) return childrenProxy(result, nxItems);
    result.count = () => result.length;
    result.peek = () => result;
    return result;
}

function childrenProxy(result, nxItems) {
    var res = nx(function () {
        var r = [];
        for (var i = 0; i < result.length; i++) {
            var rItem = unwrap(result[i]);

            if (isArray(rItem))
                r.push.apply(r, rItem);
            else if (rItem)
                r.push(rItem);
        }

        return r;
    });

    res.count = nx(function () {
        var sum = result.length - nxItems.length;
        for (var i = 0; i < nxItems.length; i++)
            sum += result[nxItems[i]]().length;
        return sum;
    });

    return res;
}

function parse(inp, custom, nxItems, res) {
    var result = res || [];

    if (!nxItems) inp = unwrap(inp);
    else if (isNexable(inp)) {
        var ind = result.push(nx(() => parse(inp, custom)));
        nxItems.push(ind - 1);
        return result;
    }

    if (isVoid(inp));

    else if (isArray(inp))
        for (var i = 0; i < inp.length; i++) {
            var ch = custom ? inp[i] : inp[i] || ' ';
            if (ch) parse(ch, custom, nxItems, result);
        }

    else if (custom || isFunc(inp.render))
        result.push(inp);

    else if (isValue(inp))
        result.push(new nxTextNode(inp));

    else throw new TypeError('Invalid nxDom child.');

    return result;
}
