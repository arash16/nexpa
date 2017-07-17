function SelectChoice(index, title, data) {
    var that = this;
    that.index = index;
    that.title = title;
    that.data = data;
    that.id = String(data.id || data.name || '') || undefined;

    if (isObject(data)) eachKey(data, function (p, v) {
        if (!hasProp(that, p))
            that[p] = v;
    });
}

SelectChoice.prototype = rawObject({
    toString: function () { return this.title; },
    valueOf: function () {
        return isVoid(this.data) ? this.title :
               isFunc(this.data.valueOf)
                   ? this.data.valueOf()
                   : this.data;
    },
    toJSON: function () {
        return isVoid(this.data) ? this.title :
               isFunc(this.data.toJSON)
                   ? this.data.toJSON()
                   : this.data;
    },
    isEqualTo: function (other) {
        return other instanceof SelectChoice ?
               this.title === other.title &&
               valEqual(this.data, other.data, true) :
               isString(other) && (this.id === other || this.title === other) ||
               valEqual(this.data, other, true);
    }
});

var TypedSelectPrototype = {
    write: function (x) {
        if (isVoid(x)) return x;

        var opts = unwrap(this.options);
        if (isNull(x)) return opts[0];
        if (x >= 0 && x < opts.length) return opts[x];
        if (x instanceof SelectChoice && opts[x.index] === x) return x;

        for (var i = 0; i < opts.length; i++)
            if (opts[i].isEqualTo(x))
                return opts[i];
    },
    valueOf: function () {
        var r = this.read();
        return r && r.valueOf();
    },
    toString: function () {
        var r = this.read();
        return r && r.toString();
    },
    toJSON: function () {
        var r = this.read();
        return r && r.toJSON();
    },
    view: 'chosen'
};


var TypedMultiSelectPrototype = {
    write: function (xx) {
        return toArray(xx)
            .map(TypedSelectPrototype.write.bind(this))
            .filter(identity);
    },
    valueOf: function () {
        return toArray(this.read())
            .map(TypedSelectPrototype.valueOf.bind(this));
    },
    toString: function () {
        return toArray(this.read())
            .map(TypedSelectPrototype.toString.bind(this))
            .join();
    },
    toJSON: function () {
        return toArray(this.read())
            .map(TypedSelectPrototype.toJSON.bind(this));
    },
    view: 'chosenMulti'
};


defineType('select', {
    refine: function (s) {
        if (s.type == 'select') {
            s.type = 'select';

            var options = s.options;
            s.options = nx(function () {
                var seen = {},
                    opts = unwrap(options),
                    result = toArray(unwrap(opts && opts.valueOf())).map(function (o, ind) {
                        var choice = unwrap(o),
                            value = choice && unwrap(choice.valueOf());

                        if (isVoid(value) || isBool(value)) return;
                        if (isValue(value)) {
                            if (seen[value] === true) return;
                            seen[value] = true;
                        }

                        return choice;
                    });

                return unique(result).map(function (data, index) {
                    var title = isValue(data) ? String(data) :
                                getProp([data], ['title', 'caption', 'text', 'name']);

                    return new SelectChoice(index, title, data);
                });
            });

            return s;
        }
    },
    create: function (meta, proto) {
        function TypedSelect() {}

        var pr = TypedSelect.prototype = extend(proto, meta.multiple
            ? TypedMultiSelectPrototype
            : TypedSelectPrototype);

        pr.remove = function (item) {
            var val = this.read(),
                ind = val.indexOf(item);

            if (ind >= 0) {
                val = val.slice();
                val.splice(ind, 1);
                this.assign(val);
            }
        }

        pr.insert = function (item) {
            if (item instanceof SelectChoice) {
                var vals = this.read();
                if (vals.indexOf(item) < 0) {
                    this.assign(vals.concat(item));
                    return item;
                }
            }
        }

        return TypedSelect;
    }
});
