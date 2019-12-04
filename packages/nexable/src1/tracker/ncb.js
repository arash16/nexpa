var pendingNodes = 0;

tracker.ncb = function () {
    var fin = tracker.state(false),
        done = computed(() => fin.peek() || fin()),
        error, value;

    pendingNodes++;

    var result = computed(() => ifThen(done, value));
    result.error = computed(() => ifThen(done, error));
    result.done = done;

    return extend(function (err, res) {
        error = err;
        value = res;
        fin(true);
        if (!--pendingNodes)
            tracker.signal();
    }, { result: result });
};
