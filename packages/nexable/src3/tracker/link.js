import { isUndefined, assert } from 'nxutils/es/index'
import valEqual from '../utils/valEqual'

const DIRTY = 0;

export default class Link {
    constructor(src, dst) {
        this.sourceNode = src;
        this.targetNode = dst;
        this.inactive = false;
        this.value = src.value;
    }

    isClean() {
        let src = this.sourceNode;
        return !src.evaluating && !src.dirtins && valEqual(this.value, src.value);
    }

    update(cln) {
        let link = this,
            target = link.targetNode,
            targetWasDirty = target.dirtins;

        assert(!link.inactive, 'Links should be active at this stage.');
        assert(target.cse <= target.tracker.currentCycle+1, "cse should be less than NEXT_CYCLE");
        if (target.cse === DIRTY || target === link.sourceNode) return;

        // link's scycle is definitely changed that we are here in this function,
        // so it's just a matter of direction (dirty to clean, or clean to dirty)
        target.dirtins += (isUndefined(cln) ? link.isClean() : cln) ? -1 : 1;
        assert(target.dirtins >= 0 && target.dirtins <= target.sources.length, 'Dirtins out of range.');


        // target was clean (dirtins=0) and now it only can be 1
        // target is clean (dirtins=0) so it was 1 (it can't be negative)
        if (!targetWasDirty || !target.dirtins) {
            // if target's scycle is changed (were clean, or become clean ~~ no dirtins)
            // then we recursively update it's targets
            link.inactive = true;
            target.eachTarget(function (nextLink) {
                // since we already know target's scycle has changed (was/has-become clean)
                // then if link & node's values are equal,
                // then we are sure that link's scycle has changed
                if (!nextLink.inactive && valEqual(nextLink.value, target.value))
                    nextLink.update();
            });
            link.inactive = false;
        }
    }
}
