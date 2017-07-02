function dispatchEvent(ev) {
    var elem = this;
    var type = ev.type;

    if (!ev.target)
        ev.target = elem;

    if (!elem.listeners)
        elem.listeners = {};

    var listeners = elem.listeners[type];

    if (listeners) return listeners.forEach(function (listener) {
        ev.currentTarget = elem
        if (isFunc(listener))
            listener(ev);
        else
            listener.handleEvent(ev);
    });

    elem.parentNode && elem.parentNode.dispatchEvent(ev);
}
