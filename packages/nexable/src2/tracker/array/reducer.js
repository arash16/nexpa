function _redReduce(cb, depth, lines) {
    lines[depth] = lines[depth] || tracker.computedArray(
            function () {
                return lines[depth - 1].size() + 1 >> 1;
            },
            function (lines, depth, cb, index) {
                var arr = lines[depth - 1];

                var s = index << 1,
                    x = arr.get(s),
                    y = arr.get(s + 1);

                return cb(x, y);
            }
        );

    return lines[depth].r = lines[depth].r || computed(function () {
            var arr = lines[depth - 1];
            if (!arr.hasAtLeast(2))
                return arr.get(0);

            return _redReduce(cb, depth + 1, lines);
        });
}

function Reducer(callback, initial) {
    if (!isFunc(callback))
        throw new TypeError(callback + ' !~ function');

    function cb(x, y) {
        var xu = isUndefined(x),
            uc = xu + isUndefined(y);

        return uc === 0 ? callback(x, y) :
               uc === 1 ? (xu ? y : x) :
               undefined;
    }

    var that = this, node;
    return tracker.computed(function () {
        node = node || _redReduce(cb, 1, [that]);
        return cb(unwrap(initial), unwrap(node));
    });
}
