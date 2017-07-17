defineType('date', {
    refine: function (s) {
        if (s.type == 'date') {
            return s;
        }
    },
    create: function (meta, proto) {
        function TypedDate() {}

        TypedDate.prototype = extend(proto, {
            write: function (newValue) {
                return newValue === '' ? newValue :
                       JulianDate.parse(newValue);
            },
            toJSON: function () {
                var res = this.valueOf();
                if (res && res.jd) return { jd: res.jd };
            }
        });

        return TypedDate;
    },
    view: 'calendar'
});
