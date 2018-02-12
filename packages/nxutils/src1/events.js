import "./generic/is-x";

function stopPropagation(e, preventDefault) {
    e.stopPropagation();
    if (preventDefault)
        e.preventDefault();
    return false;
}

var addShortcutListener = (function () {
    var re = /(?:^|\+)(alt|ctrl?|shift)/gi,
        cmKeys = ['altKey', 'ctrlKey', 'shiftKey'],
        cmKeysInd = { a: 0, c: 1, s: 2 },
        stopCalls = ['stopImmediatePropagation', 'stopPropagation', 'preventDefault'];

    return function (shortcut, handler, pre) {
        var target = this && this.addEventListener ? this : global,
            code = 'key' + shortcut[shortcut.length - 1].toUpperCase(),
            cmdKeys = [false, false, false],
            keyCode = code.charCodeAt(3),
            lk = shortcut.toLowerCase(),
            key = lk[lk.length - 1],
            lastStop = false;

        lk.match(re).forEach(function (p) {
            cmdKeys[cmKeysInd[p[0]] || cmKeysInd[p[1]]] = true;
        });

        function evHandler(e) {
            if (e.keyCode == keyCode || e.key == key || e.code == code) {
                for (var i = 0; i < 3; i++)
                    if (e[cmKeys[i]] !== cmdKeys[i]) return;

                if (e.repeat ? lastStop : handler(e) === false) {
                    e.cancelBubble = lastStop = true;
                    for (var i = 0, c; c = stopCalls[i]; i++)
                        if (e[c]) e[c]();
                }
                else lastStop = false;
            }
        }

        pre = pre === undefined || pre;
        target.addEventListener('keydown', evHandler, pre);
        return function () {
            target.removeEventListener('keydown', evHandler, pre);
        };
    };
}());


var addListener = function (w, eventName, callback, capture) {
    if (!w) return;

    if (isFunc(w.addEventListener))
        w.addEventListener(eventName, callback, capture || false);

    else if (isFunc(w.attachEvent))
        w.attachEvent('on' + eventName, callback, capture || false);

    return callback;
};


var removeListener = function (w, eventName, callback, capture) {
    if (!w) return;

    if (isFunc(w.removeEventListener))
        w.removeEventListener(eventName, callback, capture || false);

    else if (isFunc(w.detachEvent))
        w.detachEvent('on' + eventName, callback, capture || false);

    return callback;
};


if (global.document) {
    addListener(global.document, 'keydown', function (e) {
        var target = e.target;
        if (target.__evKeyDownTimer) return;

        var handler = target.onvaluechanged;
        if (isFunc(handler))
            target.__evKeyDownTimer = setTimeout(function () {
                target.__evKeyDownTimer = undefined;
                handler(e, target.value);
            }, 50);
    }, true);
}
