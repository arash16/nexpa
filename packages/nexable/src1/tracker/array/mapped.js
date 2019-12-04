function MappedArray(base, mapFunc) {
    this._items = [];
    this._base = base;
    this._mapFunc = mapFunc;
}

MappedArray.prototype = rawObject({
    ensure: function (index) {
        var self = this;
        return _once(function () {
            var item = self._base.get(index);
            return isUndefined(item) ? item : self._mapFunc(item, index);
        }, self._items, index);
    },
    size: function () {
        return this._base.size();
    },
    hasAtLeast: function (n) {
        return this._base.hasAtLeast(n);
    },
    get: function (index) {
        var self = this;
        return _once(function () {
            index = toInteger(index);
            if (index >= 0 && self.hasAtLeast(index + 1))
                return self.ensure(index);
        });
    }
}, GenericArrayMethods);
