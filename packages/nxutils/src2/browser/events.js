import { global, isFunc } from '../is-x';

let re = /(?:^|\+)(alt|ctrl?|shift)/gi,
    cmKeys = ['altKey', 'ctrlKey', 'shiftKey'],
    cmKeysInd = { a: 0, c: 1, s: 2 },
    stopCalls = ['stopImmediatePropagation', 'stopPropagation', 'preventDefault'];

export function addShortcutListener(shortcut, handler, pre) {
    let target = this && this.addEventListener ? this : global,
        code = 'key' + shortcut[shortcut.length - 1].toUpperCase(),
        cmdKeys = [false, false, false],
        keyCode = code.charCodeAt(3),
        lk = shortcut.toLowerCase(),
        key = lk[lk.length - 1],
        lastStop = false;

    lk.match(re).forEach(p => {
        cmdKeys[cmKeysInd[p[0]] || cmKeysInd[p[1]]] = true;
    });

    function evHandler(e) {
        if (e.keyCode === keyCode || e.key === key || e.code === code) {
            for (let i = 0; i < 3; i++)
                if (e[cmKeys[i]] !== cmdKeys[i]) return;

            if (e.repeat ? lastStop : handler(e) === false) {
                e.cancelBubble = lastStop = true;
                for (let i = 0, c; c = stopCalls[i]; i++)
                    if (e[c]) e[c]();
            }
            else lastStop = false;
        }
    }

    pre = pre === undefined || pre;
    target.addEventListener('keydown', evHandler, pre);
    return () => target.removeEventListener('keydown', evHandler, pre);
}

export function stopPropagation(e, preventDefault) {
    e.stopPropagation();
    if (preventDefault)
        e.preventDefault();
    return false;
}

export function addListener(w, eventName, callback, capture) {
    if (!w) return;

    if (isFunc(w.addEventListener))
        w.addEventListener(eventName, callback, capture || false);

    else if (isFunc(w.attachEvent))
        w.attachEvent('on' + eventName, callback, capture || false);

    return callback;
}

export function removeListener(w, eventName, callback, capture) {
    if (!w) return;

    if (isFunc(w.removeEventListener))
        w.removeEventListener(eventName, callback, capture || false);

    else if (isFunc(w.detachEvent))
        w.detachEvent('on' + eventName, callback, capture || false);

    return callback;
}

if (global.document) {
    addListener(global.document, 'keydown', function (e) {
        let target = e.target;
        if (target.__evKeyDownTimer) return;

        let handler = target.onvaluechanged;
        if (isFunc(handler))
            target.__evKeyDownTimer = setTimeout(function () {
                target.__evKeyDownTimer = undefined;
                handler(e, target.value);
            }, 50);
    }, true);
}
