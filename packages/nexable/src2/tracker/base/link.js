function Link(src, dst) {
	this.sourceNode = src;
	this.targetNode = dst;
	this.inactive = false;
	this.value = src.value;
}

Link.prototype.isClean = function() {
	var src = this.sourceNode;
	return !src.evaluating && !src.dirtins && valEqual(this.value, src.value);
};

Link.prototype.update = function (cln) {
    var link = this,
    	target = link.targetNode,
        targetWasDirty = target.dirtins;

	assert(!link.inactive, 'Links should be active at this stage.');
    if (target.cse > NEXT_CYCLE || target.cse == DIRTY) return;

    // link's scycle is definitely changed that we are here in this function,
    // so it's just a matter of direction (dirty to clean, or clean to dirty)
    target.dirtins += (isUndefined(cln) ? link.isClean() : cln) ? -1 : 1;

    // target was clean (dirtins=0) and now it only can be 1
    // target is clean (dirtins=0) so it was 1 (it can't be negative)
    if (!targetWasDirty || !target.dirtins) {
        // if target's scycle is changed (were clean, or become clean ~~ no dirtins)
        // then we recursively update it's targets
        eachTarget(target, function (nextLink) {
            // since we already know target's scycle has changed (was/has-become clean)
            // then if link & node's values are equal,
            // then we are sure that link's scycle has changed
            if (valEqual(nextLink.value, target.value))
                nextLink.update();
        });
    }
}



function linkSource(src, dst) {
	if (!src || !dst) return;
	var tid = dst.nodeId,
		lnk = src.targets[tid];

	if (!lnk) {
		lnk = new Link(src, dst);
		dst.sources.push(lnk);
		src.targets[tid] = lnk;
		src.targetc++;
		dst.sourcec++;
	}
	else if (lnk.inactive) {
        lnk.inactive = false;
    	lnk.value = src.value;
        dst.sources.push(lnk);
		dst.sourcec++;
	}
	return lnk;
}

function inactivateSources(node) {
	var sources = node.sources;
	for (var i=0, j=0; i<sources.length; ++i) {
		var lnk = sources[i];
		if (lnk) lnk.inactive = true;
	}
	node.dirtins
	node.sourcec = 0;
	node.sources = [];
	return sources;
}

function unlinkInactiveSources(node, sources) {
	var nodeId = node.nodeId;
	for (var i=sources.length-1; i>=0; --i) {
		var lnk = sources[i];
		if (lnk && lnk.inactive)
			unlinkTarget(lnk.sourceNode, nodeId);
	}
}

function unlinkTarget(node, targetId) {
	if (node.targets && node.targets[targetId]) {
		if (--node.targetc == 0) {
			node.targets = {};
			node.disconnect();
		}
		else delete node.targets[targetId];
	}
}

