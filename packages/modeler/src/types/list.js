function ensureString(v){
    return (tryStringify(v) || '').trim();
}

function initItem(that, item) {
    if (item && item.vid > 0 && item.parent == that)
        return item;

    var res = modeler.create(that.each, item);
    res.parent = that;
    res.getKey = res.getKey || nx(() => that.keyFunc.call(res.read(), res));
    res.getSummary = res.getSummary || nx(() => ensureString(that.summaryFunc.call(res.read(), res)));
    res.getLeftSummary = res.getLeftSummary || nx(() => ensureString(that.leftSummaryFunc.call(res.read(), res)));
    if (item) res.assign(item);
    return res;
}

defineType('list', {
    refine: function (s) {
        if (s.type == 'list') {
            if (!isNumber(s.min) || s.min < 0) s.min = Math.max(parseInt(s.min) || 0, 0);
            if (s.min && !s.required) s.required = true;
            if (s.required && !s.min) s.min = 1;

            if (!isNumber(s.max)) s.max = parseInt(s.max) || Infinity;
            if (s.max < s.min) s.max = Infinity;

            s.each = modeler.refine(s.each);

            if (!s.each.title && s.singularTitle) s.each.title = s.singularTitle;

            if (!s.key) s.key = s.each.type == 'object' ? '_id' : '$data';
            // if (s.key == '_id') s.each.items.push({ name: '_id', type: 'randomId' });
            s.keyFunc = createFunction('$data', 'return(' + s.key + ')');

            if (!s.summary) s.summary = s.each.type == 'object' ? s.each.items[0].name : '$data';
            s.summaryFunc = createFunction('$data', 'return(' + s.summary + ')');

            if (!s.leftSummary) s.leftSummary = '""';
            s.leftSummaryFunc = createFunction('$data', 'return(' + s.leftSummary + ')');

            return s;
        }
    },
    create: function (meta, proto) {
        function TypedList() {
        }

        TypedList.prototype = extend(proto, {
            write: function (newValue) {
                var that = this;
                return unique(toArray(newValue).map(x => initItem(that, x)));
            },
            insert: function (newItem, target) {
                var item = initItem(this, newItem),
                    dest = target || this.data();

                for (var i = 0; i < dest.length; i++)
                    if (dest[i].getKey() == item.getKey())
                        return i;

                this.data(dest.concat(item));
                return item;
            },
            remove: function (item) {
                var dest = this.data(),
                    index = isNumber(item) && item < dest.length ? item : dest.indexOf(item);

                if (index >= 0 && index < dest.length) {
                    var nVal = dest.slice(0);
                    nVal.splice(index, 1);
                    this.data(nVal);
                }
            },
            validate: function (val, errors) {

            },
            toJSON: function () {
                return this.data().map(x => x.toJSON());
            },
            valueOf: function () {
                return this.data().map(x => x.valueOf());
            }
        });

        return TypedList;
    },
    view: 'list'
})
