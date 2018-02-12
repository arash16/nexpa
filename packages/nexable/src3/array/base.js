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
}
