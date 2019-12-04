function MappedStruct(base, mapFunc) {
    var self = this;
    self._base = base;
    self._mapFunc = mapFunc;
    self._items = nullObject();

    self.size = base.size;
    self.keys = base.keys;

    self.clone = computed(function () {
        var keys = self.keys(),
            result = {};

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            result[key] = self.get(key);
        }

        return result;
    });
}


MappedStruct.prototype = rawObject({
    get: function (key) {
        var self = this;
        return _once(function () {
            var value = self._base.get(key);
            if (!isUndefined(value))
                return self._mapFunc(key, value);
        }, self._items, key);
    }
});
