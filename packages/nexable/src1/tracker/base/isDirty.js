function isDirty(root) {
    if (root.scycle == DIRTY) return true;
    if (!root.dirtins || root.scycle == CURRENT_CYCLE || !isFunc(root.read))
        return false;

    if ("isDev")
        if (activeNode) __isDirtyCalls++;

    eachSource(root, _isDirty_pre, _isDirty_source, _isDirty_finalizer);
    return root.scycle == DIRTY;
}


function _isDirty_pre(node, id) {
    if (isUndefined(id)) {
        if (node.scycle == NEXT_CYCLE)
            node.scycle = CURRENT_CYCLE;

        if (node.scycle <= DIRTY || node.scycle >= CURRENT_CYCLE)
            return false;

        if (!node.dirtins) {
            lockNode(node);
            return false;
        }

        node.scycle = NEXT_CYCLE;
    }

    return id;
}

function _isDirty_source(node, link, src) {
    if (node.scycle != NEXT_CYCLE || !node.dirtins)
        return true;

    if (src.scycle <= DIRTY) {
        if (!isFunc(src.read)) {
            node.scycle = DIRTY;
            node.cVal = undefined;
            return true;
        }

        activeNode = node;
        src.trEval();

        if (node.scycle != NEXT_CYCLE)
            return true;
    }

    else if (src.scycle < CURRENT_CYCLE && src.dirtins)
        return [src, ,];

    lockNode(src);
    if (!valEqual(link.cVal, src.cVal)) {
        node.scycle = DIRTY;
        return true;
    }

    if (src.read == true) {
        unlinkTarget(src, node.id);
        return;
    }

    return link;
}

function _isDirty_finalizer(node) {
    if (node.scycle == NEXT_CYCLE) {
        node.scycle = CURRENT_CYCLE;

        var dirtins = 0, sources = node.sources;
        if (node.dirtins) {
            for (var i = 0; i < sources.length; i++) {
                var lnk = sources[i], src = lnk && lnk.sourceN;
                if (lnk && (src.dirtins || !valEqual(lnk.cVal, src.cVal)))
                    dirtins++;
            }
            node.dirtins = dirtins;
            if (!dirtins)
                eachTarget(node, updatePath, 1);
        }
    }
    else {
        node.scycle = DIRTY;
        if (!node.dirtins)
            eachTarget(node, updatePath, 1);
    }

    return node.scycle == DIRTY;
}
