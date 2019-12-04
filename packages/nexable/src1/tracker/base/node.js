var __lastNodeId = 0;

function Node(value, read, dispose) {
    this.id = ++__lastNodeId;
    this.cVal = value;

    this.targets = {};
    this.targetsKeys = null;
    this.targetsCount = 0;

    if (isFunc(read)) {
        this.sources = [];
        this.dirtins = 0;

        this.read = read;
        this.scycle = DIRTY;
    }
    else {
        this.read = false;
        this.scycle = MAX_INT;
    }

    this.dispose = dispose || nopFunc;
}

Node.prototype = rawObject({
    trEval: trEval,
    trUpdate: trUpdate
});


function lockNode(node) {
    if (node.scycle < CURRENT_CYCLE)
        node.scycle = CURRENT_CYCLE;
}


var asyncFrames, _asyncFramesLen, seenTargets;
function eachTarget(node, cb, async) {
    if (!node.targetsCount) return 0;
    if (!node.targets) return node.targetsCount = 0;

    if (async) {
        var frame = [node, cb];
        if (asyncFrames) asyncFrames[_asyncFramesLen++] = frame;
        else {
            seenTargets = {};
            asyncFrames = [];
            _asyncFramesLen = 0;

            do {
                if (!seenTargets[frame[0].id]) {
                    seenTargets[frame[0].id] = true;
                    eachTarget(frame[0], frame[1]);
                }
            } while (frame = asyncFrames[--_asyncFramesLen]);
            asyncFrames = null;
        }
        return;
    }

    var targets = node.targets,
        keys = node.targetsKeys || Object.keys(targets),
        len = keys.length;

    for (var i = 0, j = 0; i < len; i++) {
        var key = keys[i],
            link = targets[key];
        if (link) cb(link);
        if (targets[key])
            keys[j++] = key;
    }

    node.targetsCount = keys.length = j;
    node.targetsKeys = j ? keys : (node.targets = null);

    return j;
}


function eachSource(root, preHandling, handling, postHandling) {
    var stack = [[root, ,]],
        stackLen = 1,
        frame;

    while (frame = stack[--stackLen]) {
        var node = frame[0],
            id = frame[1],
            hasUnlinks = frame[2];

        var preLen = stackLen,
            sources = node.sources,
            len = sources.length,
            breakFor = false;

        result = preHandling(node, id);
        if (isBool(result)) breakFor = true;


        for (id = frame[1] | 0; !breakFor && id < len; id++) {
            var link = sources[id];
            if (!link) hasUnlinks = true;
            else {
                var result = handling(node, link, link.sourceN);

                if (isArray(result)) {
                    stack[stackLen][1] = id;
                    stack[stackLen++][2] = hasUnlinks;
                    stack[stackLen++] = result;
                    breakFor = true;
                }

                else if (isBool(result))
                    breakFor = true;

                else if (!result) {
                    hasUnlinks = true;
                    sources[id] = undefined;
                }
            }
        }

        if (preLen == stackLen) {
            if (hasUnlinks) {
                for (var i = 0, j = 0; i < sources.length; i++)
                    if (sources[i])
                        sources[j++] = sources[i];
                sources.length = j;
            }

            if (!breakFor || result)
                result = postHandling(node);
        }
    }

    return result;
}
