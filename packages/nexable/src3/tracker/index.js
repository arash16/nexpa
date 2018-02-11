import GarbageCollector from './gc';
import LeafNode from './leafnode';
import MiddleNode from './midnode'

export default class Tracker {
    constructor() {
        this.gc = new GarbageCollector();

        this._immediateRecycleRequested = 0;
        this.isSignaling = false;

        this._onSinalHandlers = [];
        this._beforeSignalHandlers = [];
        this._afterSignalHandlers = [];
        this._evaluations = 0;

        this.activeNode = null;
        this.currentCycle = 1;
        this.lastNodeId = 1;
    }

    leaf(value, handlers) {
        return new LeafNode(this, value, handlers);
    }

    middle(read, handlers) {
        return new MiddleNode(this, read, handlers);
    }

    forceGC() {
        this.gc.handler(true);
    }

    signal() {
        if (this.isSignaling) return this.currentCycle;
        ++this.currentCycle;
        this.isSignaling = true;

        this.runHandlers(this._beforeSignalHandlers);
        this._beforeSignalHandlers.length = 0;

        this.runHandlers(this._onSinalHandlers);

        this.runHandlers(this._afterSignalHandlers);
        this._afterSignalHandlers.length = 0;

        this.activeNode = null;
        this.isSignaling = false;

        if (this._immediateRecycleRequested === 1) {
            this._immediateRecycleRequested++;
            this.signal();
            this._immediateRecycleRequested = 0;
        }

        return this.currentCycle;
    }

    onSignal(cb, dispose) {
        let disposed = false,
            node = this.middle(cb, disposer);

        function handler() { node.evaluate(); }

        let onSinalHandlers = this._onSinalHandlers;
        onSinalHandlers.push(handler);

        function disposer() {
            if (!disposed) {
                disposed = true;
                let ind = onSinalHandlers.indexOf(handler);
                if (ind >= 0) onSinalHandlers[ind] = undefined;
                dispose && dispose();
            }
        }

        return disposer;
    }

    beforeSignal(cb) {
        this._beforeSignalHandlers.push(cb);
    }

    afterSignal(cb) {
        this._afterSignalHandlers.push(cb);
    }

    immediateRecycle() {
        if (!this._immediateRecycleRequested)
            this._immediateRecycleRequested = 1;
        return this._immediateRecycleRequested === 1;
    }

    runHandlers(handlers) {
        let j = 0;
        for (let i = 0, h; i < handlers.length; ++i)
            if (h = handlers[i]) {
                this.activeNode = this.rootNode || true;
                handlers[j++] = h;
                h();
            }
        handlers.length = j;
    }

}
