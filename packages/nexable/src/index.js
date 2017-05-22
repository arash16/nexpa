var nx = (function () {
    import "nxutils";

    var DEFERRED_UNLINKS_INTERVAL = 2000;

    import "./tracker";
    import "./animate";

    var nxNow = extend(function () { return Tracker.now(); }, {
        isNexable: 'C',
        peek: function () { return Tracker.now.peek(); }
    });

    return rawExtend(nx, {
        now: nxNow,
        animated: animated,

        ncb: () => Tracker.ncb(),
        scope: fn => Tracker.scope(fn),

        run: function (fn) {
            return Tracker.trNode(undefined, fn, true).trEval();
        },

        computed: function (opts) {
            if ("isNodeModule") if (!"isDev") if (isObject(opts)) {
                opts.read = opts['read'];
                opts.write = opts['write'];
                opts.initial = opts['initial'];
                opts.dispose = opts['dispose'];
            }

            return Tracker.computed.apply(Tracker, arguments);
        },
        state: function () { return Tracker.state.apply(Tracker, arguments); },
        array: function () { return Tracker.array.apply(Tracker, arguments); },
        struct: function () { return Tracker.struct.apply(Tracker, arguments); },

        signal: function () { Tracker.signal();},
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
})();

if ("isNodeModule") {
    // scope parentNode
    // id state keys
    // size clear get set assign map filter slice reduce
    // async create now

    if (!"isDev") {
        ceval(function () {
            var unMin = 'now animated run scope computed state array struct signal onSignal finally unwrap'.split(' ');
            return unMin.map(function (p, v) {
                return 'nx["' + p + '"] = nx.' + p + ';';
            }).join('\n');
        });
    }

    module.exports = nx;
}
