var garbageCollectionPhase = false,
	deferredIds = nullObject(),
	deferredNodes = [],
	gcTimeout = 0;

function scheduleGC(node) {
	if (garbageCollectionPhase && !node.targetc && node.cse <= CURRENT_CYCLE)
		return node.disconnect();

	if (!deferredIds[node.nodeId]) {
		deferredIds[node.nodeId] = 1;
		deferredNodes.push(node);
	}

	if (gcTimeout) clearTimeout(gcTimeout);
	gcTimeout = setTimeout(GCHangler, DEFERRED_UNLINKS_INTERVAL);
}


function GCHangler(forced) {
	garbageCollectionPhase = true;
	if (gcTimeout && forced) clearTimeout(gcTimeout);

    var nodes = deferredNodes;
	deferredNodes = [];
	gcTimeout = 0;

    for (var i=0, node; node=nodes[i]; ++i) {
    	node.disconnect();
    	delete deferredIds[node.nodeId];
	}

    garbageCollectionPhase = false;
}

tracker.forceGC = function() { GCHangler(true); };
