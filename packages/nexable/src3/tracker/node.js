import { isFunc, isUndefined, nullObject } from 'nxutils'
import Link from './link'

export const
    DIRTY = 0,
    MAX_CYCLE = 2147483647;

export function isFalsy(value) {
    return !isUndefined(value) && !value;
}

export class BaseNode {
    constructor(tracker, handlers) {
        this.tracker = tracker;
        this.nodeId = ++tracker.lastNodeId;
        this.handlers = handlers || {};

        this.targets = nullObject(); // todo: use null object
        this.targetc = 0;
    }

    lock() {
        if (this.cse < this.tracker.currentCycle)
            this.cse = this.tracker.currentCycle;
    }

    eachTarget(cb) {
        let tgs = this.targets,
            keys = Object.keys(tgs);

        for (let i = keys.length - 1; i >= 0; --i) {
            let lnk = tgs[keys[i]];
            if (!lnk.inactive)
                cb(lnk);
        }
    }

    disposeTargets(dec) {
        this.eachTarget(function (lnk) {
            if (!lnk.isClean()) return;

            let target = lnk.targetNode;
            if (target.cse === MAX_CYCLE) return;

            if (dec) --target.sourcec;

            // if there's no active sources & there's no dirty input
            if (!target.sourcec && !target.dirtins && !target.evaluating)
                target.dispose(dec);
        });
        this.targets = null;
    }

    callHandler(h) {
        return isFunc(h) ? h(this) : h;
    }

    linkTarget(dst) {
        if (!dst) return;
        let tid = dst.nodeId,
            lnk = this.targets[tid];

        if (!lnk) {
            lnk = new Link(this, dst);
            dst.sources.push(lnk);
            this.targets[tid] = lnk;
            this.targetc++;
            if (this.sourcec) dst.sourcec++;
        }
        else if (lnk.inactive) {
            lnk.inactive = false;
            lnk.value = this.value;
            dst.sources.push(lnk);
            if (this.sourcec) dst.sourcec++;
        }
        return lnk;
    }

    inactivateSources() {
        let sources = this.sources;
        for (let i = 0; i < sources.length; ++i) {
            let lnk = sources[i];
            if (lnk) lnk.inactive = true;
        }
        this.dirtins =
        this.sourcec = 0;
        this.sources = [];
        return sources;
    }

    unlinkInactiveSources(sources) {
        let nodeId = this.nodeId;
        for (let i = sources.length - 1; i >= 0; --i) {
            let lnk = sources[i];
            if (lnk && lnk.inactive)
                lnk.sourceNode.unlinkTarget(nodeId);
        }
    }

    unlinkSources() {
        let nodeId = this.nodeId,
            sources = this.sources;
        for (let i = 0; i < sources.length; ++i) {
            let lnk = sources[i];
            if (lnk) lnk.sourceNode.unlinkTarget(nodeId);
        }
        this.dirtins =
        this.sourcec =
        this.sources.length = 0;
    }

    unlinkTarget(targetId) {
        if (this.targets && this.targets[targetId]) {
            if (--this.targetc === 0) {
                this.targets = {};
                this.disconnect();
            }
            else delete this.targets[targetId];
        }
    }
}
