function ComputedArray(sizeRead, itemRead, hasLeast) {
    this._items = [];
    this._itemRead = itemRead;
    this.size = isNexable(sizeRead) ? sizeRead : computed(sizeRead);

    if (isFunc(hasLeast))
        this._hasLeast = hasLeast
}

ComputedArray.prototype = rawObject({
    ensure: function (index) {
        return _once(this._itemRead, this._items, index);
    },
    hasAtLeast: function (n) {
        var self = this;
        return _once(function () {
            return self._hasLeast
                ? self._hasLeast(n)
                : n < self.size();
        });
    },
    get: function (index) {
        var self = this;
        return _once(function () {
            index = toInteger(index);
            if (index >= 0 && self.hasAtLeast(index + 1))
                return self.ensure(index | 0);
        });
    }
}, GenericArrayMethods);
