import { extend, isString, isArray, isNexable } from 'nxutils'
import nx from 'nexable'
import applyChildren from './apply-children'
import applyProperties from './apply-properties'
import DomNodeProxy from '../patcher'
import {
    getComputedStyles, getDisplayType, roundCssValue,
    vendorStyleProperties,
    getContentWidth,
    getViewportOffsets, getAbsoluteOffsets, getOffsetSizes,
    scrollToVisible
} from '../css'


export default function NXElement(eid, nodeName, properties, childs, namespace) {
    let elem = this;
    elem.id = eid;
    elem.nodeName = nodeName;
    elem.namespace = namespace;
    elem.properties = properties || {};
    elem.childs = childs;

    elem.parent = nx();
    elem.domNode = nx();
    elem.parentNode = nx(() => {
        if (elem.domNode()) {
            let par = elem.parent();
            if (par) return par.domNode();
        }
    });

    let nodeComputedStyles = nx(() => getComputedStyles(elem.domNode()));
    elem.computedStyles = nx(() => elem.parentNode() && nodeComputedStyles());
    elem.computedStyles.rev = nx(0);

    elem.rendered = false;
    elem.render = nx.computed({
        read: function () {
            let node = isString(elem.namespace) ? document.createElementNS(elem.namespace, elem.nodeName) : document.createElement(elem.nodeName);

            let proxy = new DomNodeProxy(elem, node);
            applyChildren(proxy, elem.childs, elem);
            applyProperties(proxy, elem.properties);

            nx.afterSignal(function () {
                elem.domNode(node);
                elem.rendered = true;
                let evs = elem.eventListeners;
                for (let i = 0, es; evs && (es = evs[i]); i++)
                    es(node);
            });

            return node;
        },
        dispose: function (node) {
            elem.domNode(undefined);
            elem.rendered = false;
            let evs = elem.eventListeners;
            for (let i = 0, es; evs && (es = evs[i]); i++)
                es.off();
        }
    });

    let offsetsNx = nx();
    elem.absoluteOffsets = nx.computed({
        read: function () {
            addListener(global, 'resize', offsetsChangeHandler);
            addListener(global, 'scroll', offsetsChangeHandler);
            if (!offsetsChangeHandler())
                return nx.repeatLater() || {};
            return offsetsNx();
        },
        dispose: function () {
            removeListener(global, 'resize', offsetsChangeHandler);
            removeListener(global, 'scroll', offsetsChangeHandler);
        }
    });

    function offsetsChangeHandler() {
        let offsets = elem.getAbsoluteOffsets();
        offsetsNx(offsets);
        return offsets;
    }
}

extend(NXElement.prototype, {
    getNode: function () {
        return this.render.peek();
    },
    focus: function () {
        let node = this.getNode();
        if (node) node.focus();
    },
    scrollToVisible: scrollToVisible,
    getContentWidth: getContentWidth,
    getOffsetSizes: getOffsetSizes,
    getViewportOffsets: getViewportOffsets,
    getAbsoluteOffsets: getAbsoluteOffsets,
    getStyles: function () {
        return getComputedStyles(this, true);
    },
    getStyle: function (property, def) {
        let that = this,
            cStyles = that.computedStyles;

        if (isString(property) && isNexable(cStyles[property]))
            return cStyles[property]();

        let p = vendorStyleProperties(property);
        if (!p) return;

        let id = p.id || p,
            sValue = cStyles[id] = cStyles[id] || nx(() => {
                    let cs = cStyles();
                    if (!cs) {
                        nx.repeatLater(true);
                        result = sValue.peek() || def;
                        return !result && isArray(p) ? p.map(x => def) : result;
                    }

                    let nodeStyle = that.domNode().style,
                        preStyles = nodeStyle.cssText;

                    nodeStyle.cssText = 'transitionDuration:0ms;' + (cs.display == 'none' ? 'display:' + getDisplayType(that) : '');
                    let result = isArray(p) ? p.map(x => roundCssValue(cs[x])) : roundCssValue(cs[p]);
                    nodeStyle.cssText = preStyles;
                    cStyles.rev();
                    return result;
                });

        if (isString(property) && !cStyles[property])
            cStyles[property] = sValue;

        return sValue();
    },
    addListener: function (eventName, handler, capture) {
        let disposed, lastBinded,
            listeners = this.eventListeners = this.eventListeners || [];

        function subscribe(node) {
            if (lastBinded === node) return;
            subscribe.off();
            addListener(lastBinded = node, eventName, handler, capture);
        }

        subscribe.off = function () {
            if (lastBinded) {
                removeListener(lastBinded, eventName, handler, capture);
                lastBinded = undefined;
            }
        };

        listeners.push(subscribe);
        if (this.rendered)
            subscribe(this.getNode());

        return function () {
            if (disposed) return;
            disposed = true;
            subscribe.off();
            let ind = listeners.indexOf(params);
            if (ind >= 0) listeners.splice(ind, 1);
        }
    }
});
