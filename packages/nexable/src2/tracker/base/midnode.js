var activeNode;
function MiddleNode(read, handlers) {
	BaseNode(this, handlers);
	this.read = read;
	this.cse = DIRTY;
	this.value = undefined;
	this.dirtins = 0;
	this.sources = [];
	this.sourcec = 0;
	this.evaluating = false;
}


MiddleNode.prototype = {
	evaluate: function() {
		var node = this;
		if (node.cse == MAX_CYCLE)
			return node.value;

		var outerNode = activeNode;
		activeNode = node;

		if (node.isDirty()) {
			node.evaluating = true;
			lockNode(node);

			var oldSources = inactivateSources(node), // sets dirtins to zero
				newValue = node.read();
			unlinkInactiveSources(node, oldSources);

			node.update(newValue);
			
			// after update, because of immediate circular references to be unClean
			node.evaluating = false;
		}

		activeNode = outerNode;

		if (node.sources.length || node.evaluating)
			linkSource(node, activeNode);

		else
			node.dispose();

		assert(node.cse!=DIRTY, "How could it be dirty in here?!")
		lockNode(node);

		return node.value;
	},
	isDirty: function() {
		var node = this;
		if (node.cse == DIRTY)
			return true;

		if (node.cse == NEXT_CYCLE)
			node.cse = CURRENT_CYCLE;

		if (!node.dirtins || node.cse >= CURRENT_CYCLE)
			return false;


		node.cse = NEXT_CYCLE; // recursion makes it CURRENT_CYCLE, then in loop we check to return DIRTY
		for (var i=0; node.dirtins && i<node.sources.length; ++i) {
			var lnk = node.sources[i];
			if (!lnk) continue;

			assert(!lnk.inactive, 'Source Link should not be inactive here.');
			if (!valEqual(lnk.sourceNode.evaluate(), lnk.value) || node.cse != NEXT_CYCLE) {
				node.cse = DIRTY;
				return true;
			}
		}

		node.cse = CURRENT_CYCLE;
		return false;;
	},

	update: function(newValue) {
		var node = this;
		assert(node.cse == CURRENT_CYCLE, 'MidNode should be clean on update call.');

		var dirts = 0;
		for (var i=0, lnk; i<node.sources.length; ++i)
			if (lnk = node.sources[i])
				dirts += !lnk.isClean();
		node.dirtins = dirts;

		node.value = newValue;

		// this node was definitely dirty (dirtins>0 or cse=DIRTY) and that's why it's evaluated & updated
		if (!dirts) // we have become clean
			eachTarget(node, function(lnk) {
				assert(!lnk.inactive, 'Target links should be active at this stage.');
				// for any target links that is clean (was not clean)
				if (lnk.isClean())
					lnk.update(true); // decrease target dirtins
			});

		return node.value;
	},

	// we don't have any sources
	dispose: function() {
		var node = this;
		if (node.cse == DIRTY) return;
		assert(node.sourcec == 0, 'sourcec should be zero on dispose.');
		assert(node.dirtins == 0, 'dirtins should be zero on dispose.');

		node.cse = MAX_CYCLE;
		eachTarget(node, function(lnk) {
			var target = lnk.targetNode;
			// if there's no active sources & there's no dirty input
			if (--target.sourcec <= 0 && !target.dirtins)
				target.dispose();
		});

		node.read =
		node.sources =
		node.targets = null;

		// if onDisposed returns truthy value, we clear value (not default)
		if (callHandler(node, node.handlers.onDisposed))
			node.value = undefined;
	},

	// we don't have any targets
	disconnect: function() {
		var node = this;
		if (node.targetc>0 || node.cse > CURRENT_CYCLE) return;
		if (!garbageCollectionPhase)
			return scheduleGC(node);

		// if canDisconnect explicitly returns falsy (not undefined), we won't disconnect from sources
		if (isFalsy(callHandler(node, node.handlers.canDisconnect))) return;

		var sources = node.sources;
		node.targets = {};
		node.sources = [];
		node.sourcec = 0;
		node.cse = DIRTY;
		node.dirtins = 0;

		if (sources)
		for (var i=sources.length-1; i>=0; --i) {
			var lnk = sources[i];
			if (lnk) unlinkTarget(lnk.sourceNode, node.nodeId);
		}

		// if onDisconnected returns truthy we will clear value (default behavior if nothing returned)
		if (!isFalsy(callHandler(node, node.handlers.onDisconnected)))
			node.value = undefined;
	}
};
