import { isNexable, isUndefined, toInteger } from 'nxutils';
import BaseArray from './base';

export default class FilteredArray extends BaseArray {
    constructor(wrapper, arr, filterFn) {
        super(wrapper);

        let self = this;
        self._base = arr;
        self._filterFn = filterFn;
        self._itemsInd = [];
        self._items = [];

        let hCache = {};
        self.hasAtLeast = function (n) {
            if ((n = n | 0) <= 0) return true;

            // items' value may change a lot,
            // less occurs to become undefined
            return this._wrapper.once(function () {
                return !isUndefined(self.get(n - 1));
            }, hCache, n);
        };

        self.size = this._wrapper.computed(function () {
            let r = self.size.peek() | 0;
            while (r && !self.hasAtLeast(r + 1)) r >>= 1;
            while (self.hasAtLeast(r + 1)) r++;
            return r;
        });
    }

    // return index of n-th non-undefined item
    nthIndex(n) {
        if (n >= 0) {
            let self = this;
            return this._wrapper.once(function () {
                let ind = n ? self.nthIndex(n - 1) + 1 : 0,
                    base = self._base;

                for (; isFinite(ind); ++ind) {
                    let item = base.get(ind);
                    if (isUndefined(item)) {
                        if (!base.hasAtLeast(ind + 1)) return;
                    }

                    else if (self._filterFn(item, ind))
                        return ind;
                }
            }, self._itemsInd, n);
        }
    }

    ensure(index) {
        let self = this;
        return this._wrapper.once(function () {
            let ind = self.nthIndex(index);
            return isUndefined(ind) ? undefined : self._base.get(ind);
        }, self._items, index);
    }

    get(index) {
        let self = this;
        return isNexable(index) ? this._wrapper.once(calc) : calc();

        function calc() {
            index = toInteger(index);
            return index >= 0 ? self.ensure(index) : undefined;
        }
    }
}
