function state(value, handlers) {
    assert(isUndefined(handlers) || isObject(handlers), "Handlers should be a object.");

    var currentValue = value,
    	writeHandlerInstalled = false,
        backingNode = new LeafNode(value, handlers),
        readingNode = new MiddleNode(read);

    function read() {
        updateBackingNode();
        return backingNode.evaluate();
    }

    function updateBackingNode() {
        if (isSignaling)
            writeHandlerInstalled = false;

        backingNode.update(currentValue);
    }

    function NxState(newValue) {
        if (!arguments.length)
            return readingNode.evaluate();

        if (!valEqual(currentValue, newValue)) {
            currentValue = newValue;

			// less backingNode.update calls
            if (isSignaling) updateBackingNode();
            else if (!writeHandlerInstalled) {
                writeHandlerInstalled = true;
                tracker.beforeSignal(updateBackingNode);
            }
        }
    }

    NxState.isNexable = 'W';
    NxState.peek = () => currentValue;
    NxState.dispose = () => backingNode.dispose();
    return NxState;
};
tracker.state = state;
