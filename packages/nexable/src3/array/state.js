import { isUndefined, isArray, toArray, toInteger } from 'nxutils';
import BaseArray from './base';

export default class StateArray extends BaseArray {
    constructor(wrapper, arr) {
        super(wrapper);

        this._items = [];
        this._size = wrapper.state(0);

        if (isArray(arr) && arguments.length === 2) this.assign(arr);
        else this.assign(toArray(arr));
    }

    ensure(index, value) {
        return this._items[index] = this._items[index] || this._wrapper.tracker.leaf(value);
    }

    size(newSize) {
        if (arguments.length) {
            let ns = this._items.length = toInteger(newSize);
            this._size(ns);
            return ns;
        }

        else return this._size();
    }

    hasAtLeast(n) {
        let self = this;
        return this._wrapper.once(() => n <= self.size());
    }

    get(index) {
        let self = this;
        return this._wrapper.once(function () {
            index = toInteger(index);
            return index >= 0 && index < self.size()
                ? self.ensure(index).evaluate()
                : undefined;
        });
    }

    set(index, value) {
        let items = this._items;

        index = toInteger(index);
        if (isFinite(index) && index >= 0) {
            if (index >= items.length)
                this.size(index + 1);

            if (items[index]) {
                // do not keep reference to useless undefined items
                if (isUndefined(value) && !items[index].targetsCount)
                    delete items[index];
                else items[index].update(value);
            }

            else if (!isUndefined(value))
                this.ensure(index, value);
        }
    }

    delete(index) {
        index = toInteger(index);
        let item = this._items[index];
        if (item) {
            if (item.targetsCount)
                item.update(undefined);
            else
                delete this._items[index];
        }
        return true;
    }

    push(item) {
        this.set(this._items.length, item);
    }

    pop() {
        // since item is getting removed,
        // we should use peek to prevent linking
        let item = this._items.pop(),
            result = item.cVal;

        item.update(undefined);

        this.size(this._items.length);
        return result;
    }

    assign(arr) {
        this.size(arr.length);

        for (let i = 0; i < arr.length; i++) {
            if (this._items[i])
                this._items[i].update(arr[i]);

            else if (!isUndefined(arr[i]))
                this.ensure(i, arr[i]);

            else if (this._items[i] && !this._items[i].targetsCount)
                delete this._items[i];
        }
    }
}
