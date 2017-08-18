function _once(fn, store, id) {
    if (!store) return new MiddleNode(fn).evaluate();
    return (store[id] || (store[id] =
    	new MiddleNode(fn, { onDisconnected: function() { delete store[id]; } }))
	).evaluate();
}


function computed(readFn, writeFn, handlers, peekFn) {
    var write = isFunc(writeFn),
        node = new MiddleNode(readFn, handlers),
        res = write ? function NxWritableComputed(newValue) {
            if (!arguments.length)
                return node.evaluate();

            write(newValue);
        } : function NxComputed() { return node.evaluate(); }

    res.isNexable = write ? 'W' : 'C';
    res.peek = isFunc(peekFn) || (() => node.value);
    return res;
}
tracker.computed = computed;
