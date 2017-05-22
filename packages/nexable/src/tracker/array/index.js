(function () {
    import "./methods";
    import "./state";
    import "./mapped";
    import "./sliced";
    import "./filtered";
    import "./computed";
    import "./factory";

    tracker.array = MakeArray(StateArray);
    tracker.computedArray = MakeArray(ComputedArray);
})();
