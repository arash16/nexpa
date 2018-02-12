import { isArray, isFunc, isUndefined, isString, isNaN, isNexable, unwrap, toFloat, extend } from 'nxutils';

let ARRAY_METHODS = ['get', 'hasAtLeast', 'peek', /* 'size', 'clone', */
    'push', 'pop', 'delete', // TODO: 'shift', 'unshift',
    'map', 'filter', 'slice',
    'reducer', 'reduce' /*, 'join', 'sum', */ // TODO: 'min', 'max', 'avg'
    // TODO: 'concat', 'sort', 'unique', 'indexOf'
];


function extendArray(arr, a, w) {
    a.nexable = arr;

    for (let i = 0; i < ARRAY_METHODS.length; i++) {
        let method = ARRAY_METHODS[i];
        if (a[method]) arr[method] = a[method].bind(a);
    }

    arr.isNexable = 'A' + (isFunc(a.set) ? 'W' : 'C');

    arr.size = w.computed(function () { return a.size(); });

    arr.clone = w.computed(function () {
        let result = new Array(a.size());
        for (let i = 0; i < result.length; i++) {
            let item = a.get(i);
            if (!isUndefined(item))
                result[i] = item;
        }
        return result;
    });

    arr.sum = a.reducer(function (x, y) { return toFloat(x) + toFloat(y); }, 0);

    let joiners = {};
    arr.join = function (separator) {
        separator = unwrap(separator);
        if (!isString(separator)) separator = String(separator || ',');

        return w.once(function () {
            return a.reducer(function (x, y) { return x + separator + y; });
        }, joiners, separator)();
    };

    return arr;
}

export default function getArrayFactory(wrapper, ctor) {
    return function () {
        if (arguments.length === 1 && isNexable(arguments[0], 'A'))
            return arguments[0];

        let args = [wrapper]; // wrapper in first argument
        for (let i = 0; i < arguments.length; ++i)
            args.push(arguments[i]);

        let a = Object.create(ctor.prototype);
        ctor.apply(a, args);

        let nxArray = nx(() => a.nexable.clone());
        return extendArray(function (index, value) {
            if (!arguments.length) return nxArray();

            if (arguments.length <= 2) {
                let ind = unwrap(index);
                if (arguments.length === 1 && isArray(ind))
                    return a.assign(ind);

                if (isUndefined(ind)) return;

                ind = parseInt(ind);
                if (!isNaN(ind))
                    return arguments.length === 2 ? a.set(ind, value) : a.get(ind);
            }

            a.assign(arguments);
        }, a, wrapper);
    }
}

// -----------------------------------------------------------------------------------

import BaseArray from '../array/base'
import FilteredArray from '../array/filtered'
import MappedArray from '../array/mapped'
import SlicedArray from '../array/sliced'

extend(BaseArray.prototype, {
    filter(filterFn) {
        return getArrayFactory(this._wrapper, FilteredArray)(this, filterFn);
    },
    map(mapFunc) {
        return getArrayFactory(this._wrapper, MappedArray)(this, mapFunc);
    },
    slice(start, end) {
        return getArrayFactory(this._wrapper, SlicedArray)(this, start, end);
    }
});
