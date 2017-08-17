var onSinalHandlers = [],
	beforeSignalHandlers = [],
	afterSignalHandlers = [];

function runHandlers(handlers) {
	for (var i=0, j=0, h; i<handlers.length; ++i)
		if (h = handlers[i]) {
			activeNode = tracker.rootNode || true;
			handlers[j++] = h;
			h();
		}
	handlers.length = j;
}

var nowNode = new LeafNode(Date.now());
tracker.now = computed(() => nowNode.evaluate());


var immediateRecycleRequested = 0,
	isSignaling = false,
	CURRENT_CYCLE = 1,
	NEXT_CYCLE = 2;

tracker.signal = function() {
	if (isSignaling) return CURRENT_CYCLE;
    NEXT_CYCLE = ++CURRENT_CYCLE + 1;
	isSignaling = true;

	nowNode.update(Date.now());


	runHandlers(beforeSignalHandlers);
	beforeSignalHandlers.length = 0;

	runHandlers(onSinalHandlers);

	runHandlers(afterSignalHandlers);
	afterSignalHandlers.length = 0;

	activeNode = null;
	isSignaling = false;

	if (immediateRecycleRequested === 1) {
		immediateRecycleRequested++;
		tracker.signal();
		immediateRecycleRequested=0;
	}

	return CURRENT_CYCLE;
};

// ----------------------------------------------------------------------

tracker.onSignal = function(cb, dispose) {
	var disposed = false,
		node = new MidNode(cb, disposer);

	function handler() { node.evaluate(); }
	onSinalHandlers.push(handler);

	function disposer() {
		if (!disposed) {
			disposed = true;
			var ind = onSinalHandlers.indexOf(handler);
			if (ind >= 0) onSinalHandlers[ind] = undefined;
			dispose && dispose();
		}
	}
	return disposer;
};

tracker.beforeSignal = function(cb) {
	beforeSignalHandlers.push(cb);
};

tracker.afterSignal = function(cb) {
	afterSignalHandlers.push(cb);
};

// ----------------------------------------------------------------------

tracker.immediateRecycle = function () {
    if (!immediateRecycleRequested)
        immediateRecycleRequested = 1;
    return immediateRecycleRequested === 1;
}

var dummyCounter = tracker.state(0);
tracker.repeatLater = function () {
    dummyCounter(dummyCounter() + 1);
};
