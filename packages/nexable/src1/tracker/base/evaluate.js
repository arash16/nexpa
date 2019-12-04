if ("isDev") {
    var __isDirtyCalls = 0,
        __evaluations = 0;
}

function trEval() {
    if (this.read == true)
        return this.cVal;


    var outerTracker = Tracker,
        outerNode = activeNode;

    // external call to another scope
    if (Tracker !== tracker) {
        var bridgeNode = Tracker.trNode();
        var exit = tracker.enter();

        var node = this;
        var dummyNode = tracker.trNode(0, () => bridgeNode.trUpdate(node.trEval()));
        dummyNode.trEval();

        exit();
        return bridgeNode.trEval();
    }

    var dirtins = this.dirtins;
    if (isDirty(this)) {
        if ("isDev") __evaluations++;

        var sources = inactiveSources(this);
        lockNode(this);

        Tracker = tracker;
        activeNode = this;

        var read = this.read,
            newValue = read();

        unlinkInactiveSources(this, sources);
        this.trUpdate(newValue, dirtins);
    }

    activeNode = outerNode;
    Tracker = outerTracker;


    if (!this.read || this.sources.length || this == activeNode) {
        if (activeNode)
            linkSource(this, activeNode);
    }
    else {
        this.read = true;
        this.scycle = MAX_INT;
        this.sources = null;
        this.dirtins = 0;
        this.targets = null;
        this.targetsKeys = null;
        this.targetsCount = 0;

        if (isFunc(this.dispose))
            this.dispose(this.cVal);
    }

    if (this.scycle != DIRTY)
        lockNode(this);

    return this.cVal;
}
