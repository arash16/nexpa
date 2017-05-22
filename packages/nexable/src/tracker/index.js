var Tracker = (function () {
    var LAST_TRACKER__ID = 0;

    var TrackerFactory = function (parentTracker) {
        var tracker = this;
        tracker.id = ++LAST_TRACKER__ID;

        import "./base";
        import "./state";
        import "./computed";
        import "./stepper";
        import "./struct";
        import "./array";

        import "./scheduler";
        import "./scope";
        import "./ncb";


        var dummyCounter = tracker.state(0);
        tracker.repeatLater = function () {
            dummyCounter(dummyCounter() + 1);
        };
    }

    TrackerFactory.prototype = rawObject({
        toString: function () { return this.id; }
    });

    return new TrackerFactory();
})();
