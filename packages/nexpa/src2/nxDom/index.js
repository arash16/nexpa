import { unwrap, nullObject, eachKey, identity, isVoid, isObject, isArray, isFunc, isString, extend, isValue, isNexable } from 'nxutils'
import NXElement from './nxElement/index'
import NXTextNode from './nxTextNode'
import nx from 'nexable'


export default class NXDom {
    constructor() {
        this.elComponents = nullObject();
        this.elBehaviors = nullObject();
        this.nxElementLastId = 0;
    }

    _newElement(nodeName, properties, childs, namespace) {
        return new NXElement(this.nxElementLastId++, nodeName, properties, childs, namespace);
    }

    _newTextNode(text) {
        return new NXTextNode(this.nxElementLastId++, text);
    }

    createElement(tag, props, children) {
        if (isObject(tag)) {
            children = props;
            props = tag;
            tag = 'div';
        }

        props = props || {};
        if (!children && isArray(props)) {
            children = props;
            props = {};
        }

        let behaviors = this._extractBehaviors(props),
            namespace = props.namespace,
            result;

        delete props.namespace;

        if (!namespace && isString(tag)) {
            tag = tag.toLowerCase();
            tag = this.elComponents[tag] || tag;
        }

        if (tag === 'virtual' || tag === '')
            result = this._parseChildren(children, true);

        else if (isFunc(tag))
            result = new tag(props, this._parseChildren(children, true), namespace);

        else if (isString(tag))
            result = this._newElement(tag, props, this._parseChildren(children), namespace);

        return behaviors(result);
    }

    defineComponent(name, ctor) {
        return this.elComponents[name.toLowerCase()] = function (props, children, namespace) {
            let result = new ctor(props, children, namespace);
            if (result && result instanceof NXElement) {
                let rProps = result.properties;
                if (props.class && rProps.class)
                    rProps.class = [props.class, rProps.class];

                if (props.style && rProps.style)
                    rProps.style = nx.unwrap(rProps, function (rp) {
                        let ex = unwrap(props.style);
                        if (!isObject(rp)) return ex;
                        if (!isObject(ex)) return rp;
                        let res = extend({}, ex),
                            changed = 0;

                        eachKey(rp, function (p, v) {
                            if (v) {
                                res[p] = v;
                                changed = true;
                            }
                        });
                        return changed ? res : ex;
                    });

                eachKey(props, function (p, v) {
                    if (!(p in rProps))
                        rProps[p] = v;
                });
            }
            return result;
        };
    }

    defineBehavior(name, handler) {
        this.elBehaviors[name] = handler;
    }

    // -----------------------------------------------------------------------------------

    _extractBehaviors(props) {
        let behaviors = undefined;
        for (let bName in this.elBehaviors) {
            let params = props[bName];
            delete props[bName];

            if (!isVoid(params)) {
                behaviors = behaviors || [];
                behaviors.push(this.elBehaviors[bName], params);
            }
        }

        return !behaviors ? identity : elem => applyBehaviors(elem, behaviors);
    }

    _parseChildren(children, custom) {
        let nxItems = [],
            result = children ? this._parse(children, custom, nxItems) : [];

        if (nxItems.length) return childrenProxy(result, nxItems);
        result.count = () => result.length;
        result.peek = () => result;
        return result;
    }

    _parse(inp, custom, nxItems, res) {
        let result = res || [];

        if (!nxItems) inp = unwrap(inp);
        else if (isNexable(inp)) {
            let ind = result.push(nx(() => this._parse(inp, custom)));
            nxItems.push(ind - 1);
            return result;
        }

        if (isVoid(inp));

        else if (isArray(inp))
            for (let i = 0; i < inp.length; i++) {
                let ch = custom ? inp[i] : inp[i] || ' ';
                if (ch) this._parse(ch, custom, nxItems, result);
            }

        else if (custom || isFunc(inp.render))
            result.push(inp);

        else if (isValue(inp))
            result.push(this._newTextNode(inp));

        else throw new TypeError('Invalid nxDom child.');

        return result;
    }
}

function applyBehaviors(elem, behaviors) {
    let result = elem;
    for (let i = 0; i < behaviors.length;) {
        let behavior = behaviors[i++],
            params = behaviors[i++];

        let bResult = behavior(result, params);
        if (!isVoid(bResult))
            result = bResult;
    }
    return result;
}

function childrenProxy(result, nxItems) {
    let res = nx(function () {
        let r = [];
        for (let i = 0; i < result.length; i++) {
            let rItem = unwrap(result[i]);

            if (isArray(rItem))
                r.push.apply(r, rItem);
            else if (rItem)
                r.push(rItem);
        }

        return r;
    });

    res.count = nx(function () {
        let sum = result.length - nxItems.length;
        for (let i = 0; i < nxItems.length; i++)
            sum += result[nxItems[i]]().length;
        return sum;
    });

    return res;
}
