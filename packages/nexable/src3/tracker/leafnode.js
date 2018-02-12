import { assert } from 'nxutils'
import { BaseNode, isFalsy, MAX_CYCLE } from './node'
import valEqual from '../utils/valEqual'

export default class LeafNode extends BaseNode {
    sourcec = 1;
    cse = MAX_CYCLE;
    disposed = false;
    evaluating = false;

    constructor(tracker, value, handlers) {
        super(tracker, handlers);
        this.value = value;
    }

    isChangeable() { return !this.disposed; }

    evaluate() {
        if (!this.disposed)
            this.linkTarget(this.tracker.activeNode);

        return this.value;
    }

    isDirty() { return false; }

    update(newValue) {
        let node = this,
            oldValue = node.value;

        if (!valEqual(oldValue, newValue)) {
            assert(!this.disposed, "Cannot update a disposed node.");

            node.value = newValue;
            node.eachTarget(function (lnk) {
                assert(!lnk.inactive, 'Target links should be active at this stage.');

                // for any target links that is clean (was not clean)
                //                       or was clean (now it's not)
                // todo: possible optimization: lnk cleanness can be cached
                if (valEqual(newValue, lnk.value))
                    lnk.update(true);
                else if (valEqual(oldValue, lnk.value))
                    lnk.update(false);
            });
        }
    }


    // we don't have sources (we won't be updated again)
    dispose() {
        let node = this;
        assert(!node.disposed, "LeafNode already disposed.");
        if (node.disposed) return;
        node.disposed = true;

        node.disposeTargets(true);

        // if onDisposed returns truthy value, we clear value (not default)
        if (node.callHandler(node.handlers.onDisposed))
            node.value = undefined;
        return true;
    }

    // we don't have targets (nothing to do)
    disconnect() {
        let node = this;
        if (node.targetc > 0) return;
        if (!node.tracker.gc.isGcPhase)
            return node.tracker.gc.schedule(node);

        // if canDisconnect explicitly returns falsy (not undefined), we won't clear value
        if (isFalsy(node.callHandler(node.handlers.canDisconnect))) return;

        // if onDisconnected returns truthy we will clear value (default behavior if nothing returned)
        if (!isFalsy(node.callHandler(node.handlers.onDisconnected)))
            node.value = undefined;
    }
}
