var DIRTY = 0; // really initial state, never evaluated        -> dirty   -> 1
var MAX_INT = 9e15; // ~ Number.MAX_SAFE_INTEGER    -> always clean


function Link(source, target) {
    this.sourceN = source;
    this.targetN = target;
    this.cVal = source.cVal;
    this.inactive = false;
}
Link.prototype = nullObject();

function linkSource(source, target) {
    if (!source || !target) return;

    if (!source.targets)
        source.targets = {};

    var tid = target.id,
        link = source.targets[tid];

    if (!link) {
        link = new Link(source, target);

        target.sources.push(link);
        // it's really important to have sources sorted
        // in the order of registration, so later when we
        // check isDirty, we will evaluate them in the original order
        // isDirty will be halted on first occurrence of change
        // so there can be short-circuits and their order is important

        source.targets[tid] = link;
        source.targetsCount++;
        if (source.targetsKeys) source.targetsKeys.push(tid);
        else source.targetsKeys = [tid];
    }

    // old link that is reused
    else if (link.inactive) {
        link.cVal = source.cVal;
        target.sources.push(link);
        link.inactive = false;
    }

    return link;
}

function isClean(link) {
    return !link.sourceN.dirtins && valEqual(link.cVal, link.sourceN.cVal);
}
