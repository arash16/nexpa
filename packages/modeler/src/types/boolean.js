function ensureBoolean(d) {
    if (isBool(d)) return d;
    if (!isVoid(d)) return !isString(d) ? Boolean(d)
        : d ? !/^false$/i.test(d) : false;
}

defineType('boolean', {
    refine: function (s) {
        if (s.type == 'boolean') {
            if (isUndefined(s.caption)) {
                s.caption = s.title;
                s.title = ' ';
            }
            return s;
        }
    },
    create: function (meta, proto) {
        function TypedBoolean() {}

        TypedBoolean.prototype = extend(proto, {
            write: function (newValue) {
                return ensureBoolean(newValue);
            },
            toString: function () {
                var val = this.valueOf();
                return (isArray(meta.caption) ? meta.caption[val | 0] : val).toString();
            }
        });

        return TypedBoolean;
    },

    initial: false,
    view: 'switch'
});
