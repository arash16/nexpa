function _isGetGetter(key) {
    return isArray(key) && key.length === 1 && isString(key[0]);
}


function ExtendStruct(fn, store, ex) {
    return extend(fn, {
        isNexable: 'S',
        keys: store.keys,
        clone: store.clone,
        size: function () { return store.size(); },
        map: function structMapper(fn) {
            var mp = new MappedStruct(store, fn);
            return ExtendStruct(function (key) {
                return !arguments.length ? mp.clone() :
                       !_isGetGetter(key) ? mp.get(key) :
                       computed(function () { return mp.get(key[0]); });
            }, mp);
        }
    }, ex);
}


tracker.struct = function (initial) {
    var store = new StateStruct(initial, NexableStruct);
    return ExtendStruct(NexableStruct, store, {
        clear: function () { return store.clear(); },
        del: function (key) { store.del(key); }
    });


    function NexableStruct(key, value) {
        var aLen = arguments.length;

        if (!aLen)
            return store.clone();

        if (aLen === 1 && _isGetGetter(key))
            return computed(function () { return store.get(key[0]); });

        if (aLen == 2 || isObject(key))
            store.set(key, value);

        return store.get(key);
    }
};
