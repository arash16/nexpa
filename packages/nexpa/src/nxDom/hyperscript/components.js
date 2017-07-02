var elComponents = {};
el.defineComponent = function (name, ctor) {
    return elComponents[name.toLowerCase()] = function (props, children, namespace) {
        var result = new ctor(props, children, namespace);
        if (result && result instanceof nxElement) {
            var rProps = result.properties;
            if (props.class && rProps.class)
                rProps.class = [props.class, rProps.class];

            if (props.style && rProps.style)
                rProps.style = nx.unwrap(rProps, function (rp) {
                    var ex = unwrap(props.style);
                    if (!isObject(rp)) return ex;
                    if (!isObject(ex)) return rp;
                    var res = extend({}, ex),
                        changed = 0;

                    eachKey(rp, function (p, v) {
                        if (v) {
                            res[p] = v;
                            changed = true;
                        }
                    });
                    return changed ? res : ex;
                });

            eachKey(props, function (p, v) {
                if (!(p in rProps))
                    rProps[p] = v;
            });
        }
        return result;
    };
};
