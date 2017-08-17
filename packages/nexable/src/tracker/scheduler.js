var isSignaling = false,
    CURRENT_CYCLE = 1,
    NEXT_CYCLE = 2;


var beforeSignalHandlers,
    onSignalHandlers = [],
    afterSignalHandlers;

function runHandlers(handlers) {
    var len = handlers && handlers.length;
    for (var i = 0, h; i < len; i++) {
        activeNode = tracker.rootNode || null;
        if (h = handlers[i]) h();
    }
}


var nowNode = tracker.trNode(Date.now());
tracker.now = computed(() => nowNode.trEval());


tracker.signal = function () {
    if (isSignaling) return CURRENT_CYCLE;
    NEXT_CYCLE = ++CURRENT_CYCLE + 1;
    isSignaling = true;

    var outerTracker = Tracker;
    Tracker = tracker;


    //console.group();
    if (nowNode.targetsCount)
        nowNode.trUpdate(Date.now());


    if (!afterSignalHandlers) {
        var beforeHandlers = beforeSignalHandlers;
        if (beforeHandlers) {
            beforeSignalHandlers = null;
            runHandlers(beforeHandlers);
        }

        runHandlers(onSignalHandlers);
    }

    var finals = afterSignalHandlers;
    afterSignalHandlers = null;
    runHandlers(finals);

    //if ("isDev") {
    //    if (__evaluations) {
    //        console.red('Evals: ' + __evaluations, {
    //            'isDirty': __isDirtyCalls
    //        });
    //
    //        __evaluations = 0;
    //        __isDirtyCalls = 0;
    //    }
    //}

    //console.groupEnd();

    Tracker = outerTracker;
    isSignaling = false;
    activeNode = null;


    if (immediateRecycleRequested === 1) {
        immediateRecycleRequested++;
        var result = tracker.signal();
        immediateRecycleRequested = 0;
        return result;
    }

    return CURRENT_CYCLE;
};


tracker.beforeSignal = function (callback) {
    beforeSignalHandlers = beforeSignalHandlers || [];
    beforeSignalHandlers.push(callback);
}

tracker.onSignal = function (callback, dispose) {
    var disposed = false,
        node = tracker.trNode(undefined, callback, disposer);
    onSignalHandlers.push(signalHandler);

    //return signalHandler.dispose = disposer;
    return disposer;

    function signalHandler() { node.trEval(); }

    function disposer() {
        if (!disposed) {
            disposed = true;
            var ind = onSignalHandlers.indexOf(signalHandler);
            onSignalHandlers.splice(ind, 1);
            dispose && dispose();
        }
    }
};

tracker.finally = function (callback) {
    if (!afterSignalHandlers) afterSignalHandlers = [callback];
    else afterSignalHandlers.push(callback);
};


var immediateRecycleRequested = 0;
tracker.immediateRecycle = function () {
    if (!immediateRecycleRequested)
        immediateRecycleRequested = 1;

    return immediateRecycleRequested === 1;
}
