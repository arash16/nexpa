modeler.refine = function (struc) {
    var meta = unwrap(struc);
    if (meta && meta.vid) meta = meta.valueOf();
    if (isString(meta)) return namedTypes[meta];
    if (!isObject(meta) || meta instanceof Type) return meta;
    if (meta._refiner) return unwrap(meta._refiner);


    var nxStruct = nx(function () {
        var s = Object.create(meta);
        for (var i = 0; i < strucRefiners.length; i++) {
            var atr = (function (ref) {
                return nx.run(() => ref.refine(s));
            })(strucRefiners[i]);
            if (!isUndefined(atr)) return atr;
        }
    });


    var nxRefiner = nx(function () {
        var s = nxStruct();
        if (!s) return;

        var type = modeler.refine(s.type);
        if (type && isFunc(type.create)) {
            var typedMeta = Object.create(s);
            typedMeta.type = type;

            eachKey(baseTypedValue, function (p, v) {
                if (!hasProp(typedMeta, p) || isVoid(typedMeta[p]))
                    typedMeta[p] = v;
            });

            typedMeta.create = function (val) {
                var ctor = type.create(s, this);
                return createTypedValue(this, ctor, val);
            };

            return typedMeta;
        }
    });

    rawExtend(meta, { _refiner: nxRefiner }, false);
    return nxRefiner();
}


var baseTypedValue = {
    write: function (x) { return x; },
    valueOf: function () { return this.read(); },
    toString: function () { return tryStringify(this.valueOf()) || ''; },
    toJSON: function () {
        var val = this.valueOf(),
            init = isVoid(this.initial) ? this.type.initial : this.initial;

        if (isNumber(val) && !isFinite(val)) val = null;
        if (valEqual(init, val, true)) return undefined;
        if (!isVoid(val) || !isVoid(init)) return val;
    }
};
