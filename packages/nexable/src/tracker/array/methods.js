import "./reducer";

var GenericArrayMethods = {
    peek: function (index) {
        throw new Error('Not Implemented.');
        //
        //var items = this._items,
        //    size = this.size.peek();
        //
        //if (arguments.length) {
        //    index = unwrapPeek(index);
        //    return index >= 0 && index < size && items[index]
        //        ? items[index].peek()
        //        : undefined;
        //}
        //
        //var result = new Array(size);
        //for (var i = 0; i < result.length; i++) {
        //    var item = items[i] && items[i].peek();
        //    if (!isUndefined(item))
        //        result[i] = item;
        //}
        //return result;
    },
    map: function (mapFunc) {
        return MakeArray(MappedArray)(this, mapFunc);
    },
    filter: function (filterFn) {
        return MakeArray(FilteredArray)(this, filterFn);
    },
    slice: function (start, end) {
        return MakeArray(SlicedArray)(this, start, end);
    },
    reducer: Reducer,
    reduce: function () { return this.reducer.apply(this, arguments)(); }
};


var ARRAY_METHODS = ['get', 'hasAtLeast', 'peek', /* 'size', 'clone', */
                     'push', 'pop', 'delete', // TODO: 'shift', 'unshift',
                     'map', 'filter', 'slice',
                     'reducer', 'reduce' /*, 'join', 'sum', */ // TODO: 'min', 'max', 'avg'
    // TODO: 'concat', 'sort', 'unique', 'indexOf'
];


function ExtendArray(arr, a) {
    a.nexable = arr;

    for (var i = 0; i < ARRAY_METHODS.length; i++) {
        var method = ARRAY_METHODS[i];
        if (a[method]) arr[method] = a[method].bind(a);
    }

    arr.isNexable = 'A';

    arr.size = tracker.computed(function () { return a.size(); });

    arr.clone = tracker.computed(function () {
        var result = new Array(a.size());
        for (var i = 0; i < result.length; i++) {
            var item = a.get(i);
            if (!isUndefined(item))
                result[i] = item;
        }
        return result;
    });

    arr.sum = a.reducer(function (x, y) { return toFloat(x) + toFloat(y); }, 0);

    var joiners = {};
    arr.join = function (separator) {
        separator = unwrap(separator);
        if (!isString(separator)) separator = String(separator || ',');

        return _once(function () {
            return a.reducer(function (x, y) { return x + separator + y; });
        }, joiners, separator)();
    }

    return arr;
}
