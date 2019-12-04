function StateArray(arr) {
    this._items = [];
    this._size = state(0);

    if (isArray(arr) && arguments.length == 1) this.assign(arr);
    else if (arguments.length > 1) this.assign(arguments)
    else this.assign(toArray(arr));
}

StateArray.prototype = rawObject({
    ensure: function (index, value) {
        return this._items[index] = this._items[index] || new LeafNode(value);
    },
    size: function (newSize) {
        if (arguments.length) {
            var ns = this._items.length = toInteger(newSize);
            this._size(ns);
            return ns;
        }

        else return this._size();
    },
    hasAtLeast: function (n) {
        var self = this;
        return _once(function () {
            return n <= self.size();
        });
    },
    get: function (index) {
        var self = this;
        return _once(function () {
            index = toInteger(index);
            return index >= 0 && index < self.size()
                ? self.ensure(index).trEval()
                : undefined;
        });
    },
    set: function (index, value) {
        var items = this._items;

        index = toInteger(index);
        if (isFinite(index) && index >= 0) {
            if (index >= items.length)
                this.size(index + 1);

            if (items[index]) {
                // do not keep reference to useless undefined items
                if (isUndefined(value) && !items[index].targetsCount)
                    delete items[index];
                else items[index].trUpdate(value);
            }

            else if (!isUndefined(value))
                this.ensure(index, value);
        }
    },
    delete: function (index) {
        index = toInteger(index);
        var item = this._items[index];
        if (item) {
            if (item.targetsCount)
                item.trUpdate(undefined);
            else
                delete this._items[index];
        }
        return true;
    },
    push: function (item) {
        this.set(this._items.length, item);
    },
    pop: function () {
        // since item is getting removed,
        // we should use peek to prevent linking
        var item = this._items.pop(),
            result = item.cVal;

        item.trUpdate(undefined);

        this.size(this._items.length);
        return result;
    },
    assign: function (arr) {
        this.size(arr.length);

        for (var i = 0; i < arr.length; i++) {
            if (this._items[i])
                this._items[i].trUpdate(arr[i]);

            else if (!isUndefined(arr[i]))
                this.ensure(i, arr[i]);

            else if (this._items[i] && !this._items[i].targetsCount)
                delete this._items[i];
        }
    }
}, GenericArrayMethods);
