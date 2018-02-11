const DEFERRED_UNLINKS_INTERVAL = 2000;

export default class GarbageCollector {
    constructor() {
        this.isGcPhase = false;
        this.deferredIds = Object.create(null);
        this.deferredNodes = [];
        this.scheduleTimer = 0;

        this.handler = this.handler.bind(this);
    }

    schedule(node) {
        if (this.isGcPhase && !node.targetc && node.cse <= node.tracker.currentCycle)
            return node.disconnect();

        if (!this.deferredIds[node.nodeId]) {
            this.deferredIds[node.nodeId] = 1;
            this.deferredNodes.push(node);
        }

        if (this.scheduleTimer) clearTimeout(this.scheduleTimer);
        this.scheduleTimer = setTimeout(this.handler, DEFERRED_UNLINKS_INTERVAL);
    }

    handler(forced) {
        this.isGcPhase = true;
        if (this.scheduleTimer && forced)
            clearTimeout(this.scheduleTimer);

        let nodes = this.deferredNodes;
        this.deferredNodes = [];
        this.scheduleTimer = 0;

        for (let i = 0, node; node = nodes[i]; ++i) {
            node.disconnect();
            delete this.deferredIds[node.nodeId];
        }

        this.isGcPhase = false;
    }
}
