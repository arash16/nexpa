import { isFunc, isUndefined, unwrap } from 'nxutils'

export default class BaseArray {
    constructor(wrapper) {
        this._wrapper = wrapper;
    }

    peek(index) {
        throw new Error('Not Implemented.');
        //
        //let items = this._items,
        //    size = this.size.peek();
        //
        //if (arguments.length) {
        //    index = unwrapPeek(index);
        //    return index >= 0 && index < size && items[index]
        //        ? items[index].peek()
        //        : undefined;
        //}
        //
        //let result = new Array(size);
        //for (let i = 0; i < result.length; i++) {
        //    let item = items[i] && items[i].peek();
        //    if (!isUndefined(item))
        //        result[i] = item;
        //}
        //return result;
    }

    reduce() { return this.reducer.apply(this, arguments)(); }

    reducer(callback, initial) {
        if (!isFunc(callback))
            throw new TypeError(callback + ' !~ function');

        function cb(x, y) {
            let xu = isUndefined(x),
                uc = xu + isUndefined(y);

            return uc === 0 ? callback(x, y) : uc === 1 ? (xu ? y : x) : undefined;
        }

        let that = this, node;
        return this._wrapper.computed(function () {
            node = node || _redReduce(cb, 1, [that]);
            return cb(unwrap(initial), unwrap(node));
        });
    }
}


function _redReduce(cb, depth, lines) {
    lines[depth] = lines[depth] || this._wrapper.computedArray(
            function () {
                return lines[depth - 1].size() + 1 >> 1;
            },
            function (lines, depth, cb, index) {
                let arr = lines[depth - 1];

                let s = index << 1,
                    x = arr.get(s),
                    y = arr.get(s + 1);

                return cb(x, y);
            }
        );

    return lines[depth].r = lines[depth].r || this._wrapper.computed(function () {
            let arr = lines[depth - 1];
            if (!arr.hasAtLeast(2))
                return arr.get(0);

            return _redReduce(cb, depth + 1, lines);
        });
}
