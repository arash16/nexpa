import { isFunc, isArray, isObject, isNumber, extend } from 'nxutils/es/index'

import { isNexable, unwrap } from 'nxutils/es/nexable'
import Tracker from './tracker/index'
import Wrapper from './wrappers/index'


const nx = function Factory() {
    let tracker = new Tracker(),
        wrapper = new Wrapper(tracker);

    function nx(x, y) {
        if (!arguments.length)
            return wrapper.state();

        if (isFunc(x))
            return wrapper.computed(x, y);

        if (isArray(x))
            return wrapper.array(x);

        if (isObject(x))
            return wrapper.struct(x);

        if (isNumber(x) && isFunc(y))
            return wrapper.stepper(x, y);

        return wrapper.state(x);
    }

    return extend(nx, {
        create() { return Factory() },

        now: wrapper.now(),
        //animated: animated,

        run: fn => _once(fn),

        computed(opts) { return wrapper.computed.apply(wrapper, arguments); },
        state() { return wrapper.state.apply(wrapper, arguments); },
        array() { return wrapper.array.apply(wrapper, arguments); },

        forceGC() { tracker.forceGC(); },
        signal() { tracker.signal(); },
        beforeSignal(callback) { return tracker.beforeSignal(callback); },
        onSignal(callback) { return tracker.onSignal(callback); },
        finally(callback) { return tracker.finally(callback); },
        afterNext(callback) { return nx.beforeSignal(() => nx.finally(callback)); },

        repeatLater(immediate) {
            wrapper.repeatLater();
            return immediate && tracker.immediateRecycle();
        },

        unwrap(nex) {
            let aLen = arguments.length;
            if (aLen <= 1) return unwrap(nex);

            let args = slice(arguments, 0, -1),
                callback = arguments[aLen - 1];

            for (let i = 0; i < args.length; i++)
                if (isNexable(args[i]))
                    return nx(function () {
                        let res = args.map(unwrap);
                        return callback.apply(null, res);
                    });

            return callback.apply(null, args);
        },

        isNexable: isNexable,
        isComputed: obj => isNexable(obj, 'C'),
        isWritable: obj => isNexable(obj, 'W'),
        isNexableArray: nxar => isNexable(nxar, 'A')
    });
}();

export default nx;
