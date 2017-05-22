var isActive = !parentTracker;

tracker.enter = function () {
    if (Tracker === tracker) return function () {};

    var outerTracker = Tracker,
        logGroupId = 'Scope ' + tracker.id;

    if (isActive) {
        logger.group(logGroupId, tracker);
        Tracker = tracker;

        return function () {
            Tracker = outerTracker;
            logger.groupEnd(logGroupId);
        };
    }
    else if (parentTracker) {
        var exitParent = parentTracker.enter();
        logger.group(logGroupId, tracker);

        isActive = true;
        tracker.signal();
        tracker.parentNode.trEval();
        Tracker = tracker;
        return function () {
            Tracker = outerTracker;
            isActive = false;

            logger.groupEnd(logGroupId);
            exitParent();
        };
    }
};


tracker.scope = function (fn) {
    function makeScope() {
        var scope = new TrackerFactory(tracker);
        var scopeState = tracker.trNode(1);

        scope.initNode = scope.trNode(0, fn);

        scope.rootNode = scope.trNode(0, function () {
            var res = scope.initNode.trEval();
            return isNexable(res) ? res() : res;
        });

        scope.onSignal(function () {
            scopeState.trUpdate(scopeState.cVal + 1);
        });

        scope.parentNode = tracker.trNode(0, function () {
            if (last && scopeState.trEval()) {
                return scope.rootNode.trEval();
            }
        });

        return scope;
    }

    var last;
    return tracker.computed({
        read: function () {
            if (!last) last = makeScope();
            return last.parentNode.trEval();
        },
        dispose: function () {
            //logger.warn('Dispose Scope', tracker, last, last.parentNode);
            last = null;
        }
    });
};
