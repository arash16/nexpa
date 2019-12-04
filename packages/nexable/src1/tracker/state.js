tracker.state = function (options, onDispose) {
    var initial = options,
        dispose = onDispose;

    if (isUndefined(dispose) && isObject(options) && isFunc(options.dispose)) {
        dispose = options.dispose;
        initial = options.initial;
    }

    var currentValue = initial,
        writeHandlerInstalled = false,
        backingNode = tracker.trNode(currentValue),
        readingNode = tracker.trNode(currentValue, read, disposer);

    function read() {
        updateBackingNode();
        return backingNode.trEval();
    }

    function disposer() {
        backingNode.trUpdate(undefined);
        if (dispose && (!isFunc(dispose) || dispose(currentValue) !== false))
            currentValue = undefined;
    }

    // less node.trUpdate execution
    function updateBackingNode() {
        if (isSignaling)
            writeHandlerInstalled = false;

        backingNode.trUpdate(currentValue);
    }

    function NxState(newValue) {
        if (!arguments.length)
            return readingNode.trEval();

        if (!valEqual(currentValue, newValue)) {
            currentValue = newValue;

            if (isSignaling) updateBackingNode();
            else if (!writeHandlerInstalled) {
                writeHandlerInstalled = true;
                tracker.beforeSignal(updateBackingNode);
            }
        }
    }

    NxState.isNexable = 'W';
    NxState.peek = () => currentValue;
    return NxState;
};
