// temporary inactivate node's sources
// links may be reused again
function inactiveSources(node) {
    var sources = node.sources;
    for (var id = 0, j = 0; id < sources.length; id++) {
        var link = sources[id];
        if (link) {
            sources[j++] = link;
            link.inactive = true;
        }
    }

    sources.length = j;
    node.sources = [];
    node.dirtins = 0;
    return sources;
}

// completely remove old links that are still inactive
// if they were used, they are linked again by link function
function unlinkInactiveSources(node, sources) {
    var nodeId = node.id;
    for (var id = 0, link; link = sources[id]; id++)
        if (link.inactive)
            unlinkTarget(link.sourceN, nodeId);
}


function unlinkTarget(node, targetId) {
    var lnk = node.targets && node.targets[targetId];
    if (lnk) {
        if (--node.targetsCount == 0) {
            node.targets = null;
            node.targetsKeys = null;
            deferUnlink(node);
        }
        else node.targets[targetId] = undefined;
    }
}
