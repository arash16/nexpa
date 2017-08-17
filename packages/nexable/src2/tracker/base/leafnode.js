function LeafNode(value, handlers) {
	BaseNode(this, handlers);
	this.value = value;
}

LeafNode.prototype = {
	cse: MAX_CYCLE,
	evaluating: false,

	evaluate: function() {
		if (!this.disposed)
			linkSource(this, activeNode);

		return this.value;
	},
	isDirty: function() { return false; },

	update: function(newValue) {
		var node = this,
			oldValue = node.value;

		if (!valEqual(oldValue, newValue)) {
			node.value = newValue;
			eachTarget(node, function(lnk) {
				assert(!lnk.inactive, 'Target links should be active at this stage.');

				// for any target links that is clean (was not clean)
				//                       or was clean (now it's not)
				// todo: possible optimization: lnk cleanness can be cached
				if (valEqual(newValue, lnk.value))
					lnk.update(true);
				else if (valEqual(oldValue, lnk.value))
					lnk.update(false);
			});
		}
	},

	// we don't have sources (we won't be updated again)
	dispose: function() {
		var node = this;
		if (node.disposed) return;
		node.disposed = true;

		eachTarget(node, function(lnk) {
			var target = lnk.targetNode;
			// if there's no active sources & there's no dirty input
			if (--target.sourcec <= 0 && !target.dirtins)
				target.dispose();
		});

		// if onDisposed returns truthy value, we clear value (not default)
		if (callHandler(node, node.handlers.onDisposed))
			node.value = undefined;
		return true;
	},

	// we don't have targets (nothing to do)
	disconnect: function() {
		var node = this;
		if (node.targetc>0) return;
		if (!garbageCollectionPhase)
			return scheduleGC(node);

		// if canDisconnect explicitly returns falsy (not undefined), we won't clear value
		if (isFalsy(callHandler(node, node.handlers.canDisconnect))) return;

		// if onDisconnected returns truthy we will clear value (default behavior if nothing returned)
		if (!isFalsy(callHandler(node, node.handlers.onDisconnected)))
			node.value = undefined;
	}
}

