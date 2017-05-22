function _once(fn, store, id) {
    if (!store) return tracker.trNode(undefined, fn, true).trEval();
    return (store[id] || (store[id] = tracker
        .trNode(undefined, fn, () => store[id] = undefined)))
        .trEval();
}


function computed(opts) {
    var o = opts;
    if (isFunc(o)) o = { read: o };

    var node = tracker.trNode(o.initial, o.read, o.dispose),
        write = isFunc(o.write),
        res = write ? function NxWritableComputed(newValue) {
            if (!arguments.length)
                return node.trEval();

            write(newValue);
        } : function NxComputed() { return node.trEval(); }

    res.isNexable = write ? 'W' : 'C';
    res.peek = isFunc(o.peek) || (() => node.cVal);
    return res;
}


// blocks unnecessary bottom-up change propagation
// re-evaluation of read-function happens only if some dependency is changed
// if no write function is provided, on first write turns to static tracker
// (read: func, write: func)
// (read: func, initial: !func)
// ({read: func, write: func, initial: value, dispose: func, peek: func})
tracker.computed = function (options, init, dispose) {
    var opts = options;
    if (isFunc(opts) && !isFunc(opts.read)) {
        opts = { read: opts };

        if (isFunc(init)) opts.write = init;
        else opts.initial = init;

        if (isFunc(dispose))
            opts.dispose = dispose;
    }

    return computed(opts);
};
