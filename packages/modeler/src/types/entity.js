defineType('entity', {
    refine: function (s) {
        if (s.type == 'entity') {
            return s;
        }
    },
    create: function (meta, proto) {
        function TypedEntity() {}

        TypedEntity.prototype = extend(proto, {
            write: function (newValue) {
                return newValue;
            }
        });

        return TypedEntity;
    },
    view: 'chosen'
});
