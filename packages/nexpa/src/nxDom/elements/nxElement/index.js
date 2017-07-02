import "./apply-children";
import "./apply-properties";

var NX_ELEMENT_LAST_ID = 0;

function nxElement(nodeName, properties, childs, namespace) {
    var elem = this;
    elem.id = ++NX_ELEMENT_LAST_ID;
    elem.nodeName = nodeName;
    elem.namespace = namespace;
    elem.properties = properties || {};
    elem.childs = childs;

    elem.parent = nx();
    elem.domNode = nx();
    elem.parentNode = nx(() => {
        if (elem.domNode()) {
            var par = elem.parent();
            if (par) return par.domNode();
        }
    });

    var nodeComputedStyles = nx(() => getComputedStyles(elem.domNode()));
    elem.computedStyles = nx(() => elem.parentNode() && nodeComputedStyles());
    elem.computedStyles.rev = nx(0);

    elem.rendered = false;
    elem.render = nx.computed({
        read: function () {
            var node = isString(elem.namespace) ?
                       document.createElementNS(elem.namespace, elem.nodeName) :
                       document.createElement(elem.nodeName);

            var proxy = new DomNodeProxy(elem, node);
            applyChildren(proxy, elem.childs, elem);
            applyProperties(proxy, elem.properties);

            nx.finally(function () {
                elem.domNode(node);
                elem.rendered = true;
                var evs = elem.eventListeners;
                for (var i = 0, es; evs && (es = evs[i]); i++)
                    es(node);
            });

            return node;
        },
        dispose: function (node) {
            elem.domNode(undefined);
            elem.rendered = false;
            var evs = elem.eventListeners;
            for (var i = 0, es; evs && (es = evs[i]); i++)
                es.off();
        }
    });

    var offsetsNx = nx();
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
        var offsets = elem.getAbsoluteOffsets();
        offsetsNx(offsets);
        return offsets;
    }
}

nxElement.prototype = rawObject({
    getNode: function () {
        return this.render.peek();
    },
    focus: function () {
        var node = this.getNode();
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
        var that = this,
            cStyles = that.computedStyles;

        if (isString(property) && isNexable(cStyles[property]))
            return cStyles[property]();

        var p = vendorStyleProperties(property);
        if (!p) return;

        var id = p.id || p,
            sValue = cStyles[id] = cStyles[id] || nx(() => {
                    var cs = cStyles();
                    if (!cs) {
                        nx.repeatLater(true);
                        result = sValue.peek() || def;
                        return !result && isArray(p) ? p.map(x => def) : result;
                    }

                    var nodeStyle = that.domNode().style,
                        preStyles = nodeStyle.cssText;

                    nodeStyle.cssText = 'transitionDuration:0ms;' + (cs.display == 'none' ? 'display:' + getDisplayType(that) : '');
                    var result = isArray(p) ? p.map(x => roundCssValue(cs[x])) : roundCssValue(cs[p]);
                    nodeStyle.cssText = preStyles;
                    cStyles.rev();
                    return result;
                });

        if (isString(property) && !cStyles[property])
            cStyles[property] = sValue;

        return sValue();
    },
    addListener: function (eventName, handler, capture) {
        var disposed, lastBinded,
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
            var ind = listeners.indexOf(params);
            if (ind >= 0) listeners.splice(ind, 1);
        }
    }
});

