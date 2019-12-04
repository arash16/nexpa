function StateStruct(obj) {
    var self = this;

    self._items = nullObject();
    self._getCache = nullObject();
    self.size = tracker.state(0);
    self.keys = computed(function () {
        var items = self._items,
            result = [];

        // checking size explicitly, makes it sensitive to additions
        if (self.size())
            for (var key in items)
                if (items[key].trEval())
                    result.push(key);

        return result;
    });

    self.clone = computed(function () {
        var items = self._items,
            result = {};

        if (self.size())
            for (var key in items) {
                var ex = items[key].trEval();
                if (ex) result[key] = ex.trEval();
            }

        return result;
    });

    if (isObject(obj))
        self.set(obj);
}

StateStruct.prototype = rawObject({
    ensure: function (key, value) {
        var item = this._items[key] || tracker.trNode();
        if (arguments.length === 2) {
            if (item.cVal) item.cVal.trUpdate(value);
            else {
                item.trUpdate(tracker.trNode(value));
                this.size(this.size.peek() + 1);
            }
        }
        return this._items[key] = item;
    },
    get: function (key) {
        var self = this;
        return _once(function () {
            var ex = self.ensure(key).trEval();
            return ex && ex.trEval();
        }, this._getCache, key);
    },
    set: function (key, value) {
        if (isObject(key))
            for (var k in key)
                this.set(k, key[k]);

        else this.ensure(key, value);
    },
    del: function (key, item) {
        if (item = this._items[key]) {
            if (item.cVal) {
                item.cVal.trUpdate(undefined);
                item.trUpdate(undefined);
                this.size(this.size.peek() - 1);
            }

            if (!item.targetsCount)
                delete this._items[key];
        }
    },
    clear: function () {
        for (var key in this._items)
            this.del(key);
    }
});
