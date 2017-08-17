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
	var tgs = node.targets;
	for (var key in tgs) {
		var lnk = tgs[key];
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
