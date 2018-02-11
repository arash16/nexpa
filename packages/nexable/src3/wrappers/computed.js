import { isFunc, isObject } from 'nxutils/es/index'

export default function getComputedFactory(tracker) {
    function computed(readFn, writeFn, handlers, peekFn) {
        let write = isFunc(writeFn),
            node = tracker.middle(readFn, handlers),
            res = write ? function NxWritableComputed(newValue) {
                if (!arguments.length)
                    return node.evaluate();

                write(newValue);
            } : function NxComputed() { return node.evaluate(); };

        res.isNexable = write ? 'W' : 'C';
        res.peek = isFunc(peekFn) || (() => node.value);
        return res;
    }

    return function (readFn, writeFn, handlers) {
        if (isObject(readFn))
            return computed(readFn.read, readFn.write, {
                onDisposed: readFn.onDisposed,
                canDisconnect: readFn.canDisconnect,
                onDisconnected: readFn.onDisconnected
            });

        return computed(readFn, writeFn, handlers);
    };
}
