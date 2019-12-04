function trUpdate(newValue, oldDirtins) {
    // here we only update dirtins independent of nodes' scycle
    // dirtins are a forward propagation of change, thus better performance
    // scycle is a means of locking down nodes so that they remain unchanged in middle
    // of evaluations until some signaling happens.


    // each source which is not in evaluated scycle or has possible dirty inputs
    // is considered as a possible dirty input
    var newDirtins = this.dirtins;
    if (newDirtins === 0 && this.read) {
        for (var id = 0, link; link = this.sources[id]; id++) {
            link.cVal = link.sourceN.cVal;
            if (link.sourceN.dirtins)
                newDirtins++;
        }

        this.dirtins = newDirtins;
    }

    var oldVal = this.cVal;
    if (!valEqual(oldVal, newValue, true)) {
        this.cVal = newValue;
        eachTarget(this, function (outLink) {
            // for any targets of this node, if out-link is changed
            // if it was valid, now it's not
            // if it  is valid, so it wasn't
            if (!outLink.inactive) {
                if ((!oldDirtins && (newDirtins || valEqual(outLink.cVal, oldVal))) ||
                    (!newDirtins && (oldDirtins || valEqual(outLink.cVal, newValue))))
                    updatePath(outLink);
            }
        }, 1);
    }
    else if (!newDirtins ^ !oldDirtins)
        eachTarget(this, updatePath, 1);

    return this.cVal;
}


function updatePath(link) {
    var target = link.targetN,
        targetWasDirty = target.dirtins;

    if (link.inactive || target.scycle > NEXT_CYCLE) return;


    if (target.scycle != DIRTY) {
        // link's scycle is definitely changed that we are here in this function,
        // so it's just a matter of direction (dirty to clean, or clean to dirty)
        target.dirtins += isClean(link) ? -1 : 1;
    }

    // target was clean (dirtins=0) and now it only can be 1
    // target is clean (dirtins=0) so it was 1 (it can't be negative)
    if (!targetWasDirty || !target.dirtins) {
        // if target's scycle is changed (were clean, or become clean ~~ no dirtins)
        // then we recursively update it's targets
        eachTarget(target, function (nextLink) {
            // since we already know target's scycle has changed (was/has-become clean)
            // then if link & node's values are equal,
            // then we are sure that link's scycle has changed
            if (valEqual(nextLink.cVal, target.cVal))
                updatePath(nextLink);
        }, 1);
    }
}
