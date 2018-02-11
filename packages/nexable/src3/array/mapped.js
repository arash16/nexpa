import { isUndefined, toInteger } from 'nxutils/es/index';
import BaseArray from './base';

export default class MappedArray extends BaseArray {
    constructor(wrapper, base, mapFunc) {
        super(wrapper);

        this._items = [];
        this._base = base;
        this._mapFunc = mapFunc;
    }

    ensure(index) {
        let self = this;
        return this._wrapper.once(function () {
            let item = self._base.get(index);
            return isUndefined(item) ? item : self._mapFunc(item, index);
        }, self._items, index);
    }

    size() {
        return this._base.size();
    }

    hasAtLeast(n) {
        return this._base.hasAtLeast(n);
    }

    get(index) {
        let self = this;
        return this._wrapper.once(function () {
            index = toInteger(index);
            if (index >= 0 && self.hasAtLeast(index + 1))
                return self.ensure(index);
        });
    }
}
