var LAST_NODE_ID = 1;

function BaseNode(node, handlers) {
	node.nodeId = ++LAST_NODE_ID;
	node.handlers = handlers || {};

	node.targets = {}; // todo: use null object
	node.targetc = 0;
}

function lockNode(node) {
	if (node.cse < CURRENT_CYCLE)
		node.cse = CURRENT_CYCLE;
}

function eachTarget(node, cb) {
	var tgs = node.targets,
		keys= Object.keys(tgs);

	for (var i=keys.length-1; i>=0; --i) {
		var lnk = tgs[keys[i]];
		if (!lnk.inactive)
			cb(lnk);
	}
}

function callHandler(node, h) {
	return isFunc(h) ? h(node) : h;
}

function isFalsy(value) {
	return !isUndefined(value) && !value;
}

function disposeTargets(node, dec) {
	eachTarget(node, function(lnk) {
		if (lnk.isClean()) {
			var target = lnk.targetNode;
			if (target.cse == MAX_CYCLE) return;

			if (dec) --target.sourcec;

			// if there's no active sources & there's no dirty input
			if (!target.sourcec && !target.dirtins && !target.evaluating)
				target.dispose(dec);
		}
	});
	node.targets = null;
}
