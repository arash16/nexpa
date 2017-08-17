var nx = function() {
	import "nxutils";
	import "./tracker";

    function nx(x, y) {
        if (!arguments.length)
            return Tracker.state();

        if (isFunc(x))
            return Tracker.computed(x, y);

        if (isArray(x))
            return Tracker.array(x);

        if (isObject(x))
            return Tracker.struct(x);

        if (isNumber(x) && isFunc(y))
            return Tracker.stepper(x, y);

        return Tracker.state(x);
    }

    var nxNow = extend(function () { return Tracker.now(); }, {
        isNexable: 'C',
        peek: function () { return Tracker.now.peek(); }
    });

    return rawExtend(nx, {
        now: nxNow,
        //animated: animated,

        run: fn => _once(fn),

        computed: function (opts) { return Tracker.computed.apply(Tracker, arguments); },
        state: function () { return Tracker.state.apply(Tracker, arguments); },
        array: function () { return Tracker.array.apply(Tracker, arguments); },

        signal: function () { Tracker.signal(); },
        beforeSignal: function (callback) { return Tracker.beforeSignal(callback); },
        onSignal: function (callback) { return Tracker.onSignal(callback); },
        finally: function (callback) { return Tracker.finally(callback); },
        afterNext: function(callback) { return nx.beforeSignal(() => nx.finally(callback)); },

        repeatLater: function (immediate) {
            Tracker.repeatLater();
            return immediate && Tracker.immediateRecycle();
        },

        unwrap: function (nex) {
            var aLen = arguments.length
            if (aLen <= 1) return unwrap(nex);

            var args = slice(arguments, 0, -1),
                callback = arguments[aLen - 1];

            for (var i = 0; i < args.length; i++)
                if (isNexable(args[i]))
                    return nx(function () {
                        var res = args.map(unwrap);
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

if ("isNodeModule")
    module.exports = nx;
