import { extend, isUndefined, isArray, isVoid } from 'nxutils'
import { vendorStyleProperty } from '../css'
import ChildsPatcher from './childs-patcher'

export default function DomNodeProxy(element, node) {
    this._domNode = node;
    this._element = element;
    this._childsPatcher = undefined;
}

extend(DomNodeProxy.prototype, {
    childsPatcher: function (newItems) {
        let oldPatcher = this._childsPatcher,
            newPatcher = new ChildsPatcher(this, newItems, oldPatcher);

        return this._childsPatcher = newPatcher;
    },
    setProp: function (propName, propValue) {
        let node = this._domNode;
        if (propName) node[propName] = propValue;
    },
    setAttr: function (key, value) {
        let node = this._domNode;
        if (key) {
            if (isUndefined(value))
                node.removeAttribute(key);
            else node.setAttribute(key, value);
        }
    },
    setClasses: function (val) {
        if (isArray(val)) val = val.join(' ');
        this.setProp('className', val || '');
    },
    setStyle: function (key, val) {
        let node = this._domNode;
        key = vendorStyleProperty(key, node);
        if (key) {
            if (!isUndefined(val))
                node.style.setProperty(key, val);
            else node.style.removeProperty(key);
            node.style[key] = isVoid(val) ? '' : val;
        }
    },
    getStyle: function (key) {
        let node = this._domNode,
            vKey = vendorStyleProperty(key, node);
        if (vKey) return node.style[vKey];
    }
});
