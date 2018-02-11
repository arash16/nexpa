import { isFunc, isNexable, toInteger } from 'nxutils/es/index';
import BaseArray from './base';

export default class ComputedArray extends BaseArray {
    constructor(wrapper, sizeRead, itemRead, hasLeast) {
        super(wrapper);

        this._items = [];
        this._itemRead = itemRead;
        this.size = isNexable(sizeRead) ? sizeRead : wrapper.computed(sizeRead);

        if (isFunc(hasLeast))
            this._hasLeast = hasLeast
    }

    ensure(index) {
        return this._wrapper.once(this._itemRead, this._items, index);
    }

    hasAtLeast(n) {
        return this._wrapper.once(() =>
            this._hasLeast
                ? this._hasLeast(n)
                : n < this.size()
        );
    }

    get(index) {
        let self = this;
        return this._wrapper.once(function () {
            index = toInteger(index);
            if (index >= 0 && self.hasAtLeast(index + 1))
                return self.ensure(index | 0);
        });
    }
}
