function FilteredArray(arr, filterFn) {
    var self = this;
    self._base = arr;
    self._filterFn = filterFn;
    self._itemsInd = [];
    self._items = [];

    var hCache = {};
    self.hasAtLeast = function (n) {
        if ((n = n | 0) <= 0) return true;

        // items' value may change a lot,
        // less occurs to become undefined
        return _once(function () {
            return !isUndefined(self.get(n - 1));
        }, hCache, n);
    };

    self.size = computed(function () {
        var r = self.size.peek() | 0;
        while (r && !self.hasAtLeast(r + 1)) r >>= 1;
        while (self.hasAtLeast(r + 1)) r++;
        return r;
    });
}

FilteredArray.prototype = rawObject({
    // return index of n-th non-undefined item
    nthIndex: function (n) {
        if (n >= 0) {
            var self = this;
            return _once(function () {
                var ind = n ? self.nthIndex(n - 1) + 1 : 0,
                    base = self._base;

                for (; isFinite(ind); ++ind) {
                    var item = base.get(ind);
                    if (isUndefined(item)) {
                        if (!base.hasAtLeast(ind + 1)) return;
                    }

                    else if (self._filterFn(item, ind))
                        return ind;
                }
            }, self._itemsInd, n);
        }
    },

    ensure: function (index) {
        var self = this;
        return _once(function () {
            var ind = self.nthIndex(index);
            return isUndefined(ind) ? undefined :
                   self._base.get(ind);
        }, self._items, index);
    },

    get: function (index) {
        var self = this;
        return isNexable(index) ? _once(calc) : calc();

        function calc() {
            index = toInteger(index);
            return index >= 0 ? self.ensure(index) : undefined;
        }
    }
}, GenericArrayMethods);
