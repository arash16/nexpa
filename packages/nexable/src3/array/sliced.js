import { isFunc, toInteger } from 'nxutils';
import BaseArray from './base';

export default class SlicedArray extends BaseArray {
    constructor(wrapper, base, start, end) {
        super(wrapper);

        let self = this;
        self._items = [];
        self._base = base;

        if (!isFunc(start)) start = toInteger(start, 0);
        if (!isFunc(end)) end = toInteger(end, Infinity);

        self._start = this._wrapper.computed(function () { return toInteger(start, 0); });
        self._end = this._wrapper.computed(function () { return toInteger(end, Infinity); });

        self.size = this._wrapper.computed(function () {
            let base = self._base,
                s = self._start(),
                e = self._end();

            if (!isFinite(e)) {
                if (s < 0) return base.hasAtLeast(-s) ? -s : base.size();
                let sz = base.size() - s;
                return sz <= 0 ? 0 : sz;
            }

            // e=0 || (s>=e && sign(s)==sign(e))
            if (!e || (s * e > 0 && s >= e)) return 0;

            if (!s) {
                // s=0 && e>0
                if (e > 0) return base.hasAtLeast(e) ? e : base.size();

                // s=0 && e<0
                else return base.hasAtLeast(-e) ? base.size() + e : 0;
            }

            // sign(s) == sign(e) && s!=0 && e!=0
            if (s * e > 0) {
                let n = Math.max(Math.abs(s), Math.abs(e), e - s);
                if (base.hasAtLeast(n)) return e - s;
            }


            s = s < 0 ? base.size() + s : s;
            s = s <= 0 ? 0 : s;
            if (!base.hasAtLeast(s)) return 0;

            e = e < 0 ? base.size() + e : e;
            e = e <= 0 ? 0 : e;
            if (e <= s) return 0;

            if (!base.hasAtLeast(e)) e = base.size();
            return e - s;
        });
    }

    ensure(index) {
        let self = this;
        return this._wrapper.once(function () {
            if (self.hasAtLeast(index + 1)) {
                let s = self._start();
                s = s < 0 ? s + self._base.size() : s;
                s = s < 0 ? 0 : s;
                return self._base.get(s + index);
            }
        }, self._items, index);
    }

    hasAtLeast(n) {
        let self = this;
        return this._wrapper.once(function () {
            if (n <= 0) return true;

            let s = self._start(),
                e = self._end();

            if (isFinite(e)) {
                if (!e || (s * e > 0 && n > e - s) || (!s && e > 0 && n > e))
                    return false;
            }

            // #(-start, Inf)<n
            else if (s < 0) {
                return -s >= n ? self._base.hasAtLeast(s + n) : false;
            }

            return n <= self.size();
        });
    }

    get(index) {
        index = toInteger(index);
        if (index >= 0)
            return this.ensure(index);
    }
}
