function MakeArray(ctor) {
    return function () {
        if (arguments.length == 1 && isNexable(arguments[0], 'A'))
            return arguments[0];

        var a = Object.create(ctor.prototype);
        ctor.apply(a, arguments);

        var nxArray = nx(function () {
            return a.nexable.clone();
        });

        return ExtendArray(function (index, value) {
            if (!arguments.length) return nxArray();

            if (arguments.length <= 2) {
                var ind = unwrap(index);
                if (arguments.length == 1 && isArray(ind))
                    return a.assign(ind);

                if (isUndefined(ind)) return;

                ind = parseInt(ind);
                if (!isNaN(ind))
                    return arguments.length == 2 ?
                           a.set(ind, value) :
                           a.get(ind);
            }

            a.assign(arguments);
        }, a);
    }
}
