import { assert } from 'nxutils'
import { BaseNode, isFalsy, MAX_CYCLE, DIRTY } from './node';
import valEqual from '../utils/valEqual';

export default class MiddleNode extends BaseNode {
    constructor(tracker, read, handlers) {
        super(tracker, handlers);
        this.value = undefined;
        this.read = read;
        this.cse = // DIRTY;
        this.dirtins =
        this.sourcec = 0;
        this.sources = [];
        this.evaluating = false;
    }

    isChangeable() {
        let node = this,
            result = false,
            osc = node.sourcec;

        // isChangeable is only used to see if we have to recalculate sourcec
        // if a node is evaluating, it's possible that it'll have some sourcec
        if (node.evaluating) return true;
        if (!osc) return result;

        node.sourcec = 0;
        for (let i = 0; !result && i < node.sources.length; ++i)
            result = node.sources[i].sourceNode.isChangeable();
        node.sourcec = osc;
        return result;
    }

    evaluate() {
        let node = this;
        if (node.cse === MAX_CYCLE)
            return node.value;

        let tracker = this.tracker;
        let outerNode = tracker.activeNode;
        tracker.activeNode = node;

        let dec = !!node.sourcec;
        if (node.isDirty()) {
            if (node.cse === MAX_CYCLE) {
                tracker.activeNode = outerNode;
                return node.value;
            }

            node.evaluating = true;
            node.lock();

            let oldSources = node.inactivateSources(), // sets dirtins to zero
                newValue = node.read();
            node.unlinkInactiveSources(oldSources);

            node.evaluating = false; // outlinks should be clean for updating
            node.update(newValue);

            ++this.tracker._evaluations;
        }
        else if (node.evaluating)
            ++this.tracker._evaluations;

        tracker.activeNode = outerNode;

        if (node.sourcec || node.dirtins || node.evaluating)
            node.linkTarget(tracker.activeNode);
        else
            node.dispose(dec);

        assert(node.cse !== DIRTY, "How could it be dirty in here?!");
        node.lock();

        return node.value;
    }

    isDirty() {
        let node = this;
        if (node.cse === DIRTY)
            return true;

        let currentCycle = node.tracker.currentCycle,
            nextCycle = currentCycle + 1;
        if (node.cse === nextCycle)
            node.cse = currentCycle;

        if (!node.dirtins || node.cse >= currentCycle)
            return false;

        let oe = this.tracker._evaluations;
        this.tracker._evaluations = 0;

        node.cse = nextCycle; // recursion makes it CURRENT_CYCLE, then in loop we check to return DIRTY
        for (let i = 0; node.dirtins && i < node.sources.length; ++i) {
            let lnk = node.sources[i];

            assert(!lnk.inactive, 'Source Link should not be inactive here.');
            if (!valEqual(lnk.sourceNode.evaluate(), lnk.value) || node.cse !== nextCycle) {
                if (node.cse === MAX_CYCLE) return false;

                node.cse = DIRTY;
                return true;
            }
        }
        node.cse = currentCycle;

        // any dirtiness is possibly because of circular chains
        // we should recalculate sourcec and if it's zero and
        // there was no evaluations down this node then
        // this node should become clean
        if (node.dirtins && !getSourcec(node) && !this.tracker._evaluations) {
            node.eachTarget(function (lnk) {
                if (lnk.isClean())
                    lnk.update(true);
            });
            node.dirtins = 0;
        }
        this.tracker._evaluations = oe;

        // if it has dirtins here, it means there are some
        // circular dependencies that didn't change, but may change later
        return false;
    }

    update(newValue) {
        let node = this;
        assert(node.cse === node.tracker.currentCycle, 'MidNode should be clean on update call.');

        let dirts = node.targets[node.nodeId] && !valEqual(node.value, newValue) ? 1 : 0;
        for (let i = 0, lnk; i < node.sources.length; ++i)
            if ((lnk = node.sources[i]).sourceNode !== node)
                dirts += !lnk.isClean();
        node.dirtins = dirts;

        node.value = newValue;

        // this node was definitely dirty (dirtins>0 or cse=DIRTY) and that's why it's evaluated & updated
        if (!dirts) // we have become clean & we're not self-recursive
            node.eachTarget(function (lnk) {
                assert(!lnk.inactive, 'Target links should be active at this stage.');
                // for any target links that is clean (was not clean)
                if (lnk.isClean())
                    lnk.update(true); // decrease target dirtins
            });

        return node.value;
    }

    // we don't have any sources
    dispose(dec) {
        let node = this;
        if (node.cse === DIRTY || node.cse === MAX_CYCLE) return;
        node.cse = MAX_CYCLE;

        assert(node.sourcec === 0, 'sourcec should be zero on dispose.');
        assert(node.dirtins === 0, 'dirtins should be zero on dispose.');
        assert(!node.evaluating, 'cannot dispose a evaluating node.');

        // we may have sources, but they're circular
        node.unlinkSources();

        node.read =
        node.sources = null;
        node.disposeTargets(dec);

        // if onDisposed returns truthy value, we clear value (not default)
        if (node.callHandler(node.handlers.onDisposed))
            node.value = undefined;
    }

    // we don't have any targets
    disconnect() {
        let node = this;
        if (node.targetc > 0 || node.cse > node.tracker.currentCycle) return;
        if (!node.tracker.gc.isGcPhase)
            return node.tracker.gc.schedule(node);

        // if canDisconnect explicitly returns falsy (not undefined), we won't disconnect from sources
        if (isFalsy(node.callHandler(node.handlers.canDisconnect))) return;

        let sources = node.sources;
        node.targets = {};
        node.sources = [];
        node.sourcec = 0;
        node.cse = DIRTY;
        node.dirtins = 0;

        for (let i = sources.length - 1; i >= 0; --i)
            sources[i].sourceNode.unlinkTarget(node.nodeId);

        // if onDisconnected returns truthy we will clear value (default behavior if nothing returned)
        if (!isFalsy(node.callHandler(node.handlers.onDisconnected)))
            node.value = undefined;
    }
}

function recursiveResetSourcec(node) {
    if (!node.sourcec || node.cse === MAX_CYCLE) return;

    node.sourcec = 0;
    for (let i = 0; i < node.sources.length; ++i)
        recursiveResetSourcec(node.sources[i].sourceNode);
}

function getSourcec(node) {
    let result = node.sourcec;
    if (!result) return result;

    console.log('getSourcec called');
    if (!node.isChangeable())
        recursiveResetSourcec(node);

    return node.sourcec;
}
