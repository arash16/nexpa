tracker.stepper = function (count, read) {
    var step = state(0),
        awaits = state(0);

	assert(count > 0, "Stepper Counter should be greater than zero.");

    var result = computed(function () {
        if (awaits()) return step(), result.peek();
        else {
            var res = read.call(result, step.peek());

            // when step became zero, next eval won't execute
            // until some other dependency is changed
            if (step.peek() < count - 1)
                step(step() + 1);

            else step(0);

            return isUndefined(res) && awaits.peek() ? result.peek() : res;
        }
    });

    result.async = function () {
        awaits(awaits.peek() + 1);
        var done;
        return function () {
            if (!done) {
                done = true;
                awaits(awaits.peek() - 1);
            }
        };
    };

    return result;
};
