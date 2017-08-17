var deferredIds = {},
    deferredNodes = [],
    lastDeferTime,
    gcInterval,
    inGc;

function deferUnlink(node) {
    if (!node.read) {
        if (node.dispose == true) {
            node.cVal = undefined;
            node.scycle = DIRTY;
        }
        return;
    }

    if (!node.targetsCount && ((inGc && node.scycle <= CURRENT_CYCLE) || node.dispose == true))
        return unlinkSources(node);

    if (!deferredIds[node.id]) {
        deferredIds[node.id] = true;
        deferredNodes.push(node);
    }

    lastDeferTime = Date.now();
    gcInterval = gcInterval || setTimeout(_gc, DEFERRED_UNLINKS_INTERVAL);
}

function _gc() {
    if (Date.now() - lastDeferTime < DEFERRED_UNLINKS_INTERVAL && deferredNodes.length < 10000) {
        lastDeferTime = Date.now();
        return gcInterval = setTimeout(_gc, DEFERRED_UNLINKS_INTERVAL);
    }

    var nodes = deferredNodes;
    deferredNodes = [];
    deferredIds = {};
    gcInterval = 0;
    inGc = true;


    for (var i = 0, node; node = nodes[i]; i++)
        if (!node.targetsCount && node.scycle <= CURRENT_CYCLE)
            unlinkSources(node);

    inGc = false;


    _log_gcCum += _log_gcCounts;
    console.warn('GC Nodes', _log_gcCounts, _log_gcCum, __lastNodeId);
    _log_gcCounts = 0;
}

var _log_gcCounts = 0,
    _log_gcCum = 0;


function unlinkSources(node) {
    if (!node.sources || (!node.targetsCount && !node.scycle)) return;
    _log_gcCounts++;

    node.targets = null;
    node.targetsKeys = null;
    node.targetsCount = 0;

    var isFastDisposable = node.dispose == true;
    if (isFastDisposable || node.dispose(node.cVal) !== false) {
        var sources = node.sources;
        node.sources = isFastDisposable ? null : [];
        node.cVal = undefined;
        node.scycle = DIRTY;
        node.dirtins = 0;

        for (var id = 0; id < sources.length; id++)
            if (sources[id])
                unlinkTarget(sources[id].sourceN, node.id);
    }
}
