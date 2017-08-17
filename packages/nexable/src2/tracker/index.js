var Tracker = function() {
	const
		DIRTY = 0,
		MAX_CYCLE = 2147483647,
		DEFERRED_UNLINKS_INTERVAL = 2000;

	function TrackerFactory() {
		var tracker = this;

		import "./base";
        import "./state";
        import "./computed";
        import "./stepper";

        // todo: array, struct

		import "./scheduler";
	}

	return new TrackerFactory();
}();
