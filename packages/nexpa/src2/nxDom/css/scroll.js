import { ensureDomNode } from './utils'

export function scrollToVisible() {
    var node = ensureDomNode(this);
    if (!node) return;

    var setters = [], flag;
    for (var offPar; offPar = node.offsetParent; node = offPar) {
        setters.push([node]);
        for (var par = node; par; par = par !== offPar && par.parentElement)
            if (par === document.body || par.scrollHeight > par.offsetHeight)
                setters.push(flag = par);
    }

    if (!flag) return;

    var progress = nx.animated(0, 1, 500),
        scrolled = new Array(setters.length);

    nx.onSignal(function () {
        var p = progress(), cot = 0, id = -1;
        if (p === 1) return;

        for (var i = 0, parent; parent = setters[i]; i++)
            if (parent[0]) {
                var node = parent[0],
                    noh = outerHeight(node);
                cot += node.offsetTop;
            }
            else if (node !== parent) {
                var mst = (noh - parent.offsetHeight) / 2,
                    poh = outerHeight(parent),
                    ost = parent.scrollTop,
                    nst = bounded(cot + (mst < 0 ? mst : -5), 0, parent.scrollHeight - poh);

                if (scrolled[++id] || nst <= ost || nst >= ost + node.offsetHeight || parent != document.body) {
                    parent.scrollTop = ost + p * (nst - ost);
                    scrolled[id] = true;
                }
                cot -= parent.scrollTop;
            }
    });
}

export function outerHeight(node) {
    return node === document.body ? window.innerHeight - 50 : node.offsetHeight;
}
