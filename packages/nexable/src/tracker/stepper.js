tracker.stepper = function (count, read) {
    //return nx.scope(function () {
        var state = nx(0),
            awaits = nx(0),
            sgn = count < 0 ? -1 : 1;

        count = (count | 0) || 2;
        if (count < 0) count = -count;

        var result = nx(function () {
            if (awaits()) return state(), result.peek();
            else {
                var res = read.call(result, sgn * state.peek());

                // when state became zero, next eval won't execute
                // until some other dependency is changed
                if (state.peek() < count - 1)
                    state(state() + 1);

                else state(0);

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


        //return nx(function () {
            return result;
        //});
    //});


    //return nx(function () {
    //    var state = nx(0),
    //        sgn = count < 0 ? -1 : 1;
    //
    //    count = (count | 0) || 2;
    //    if (count < 0) count = -count;
    //
    //    var result = nx(function () {
    //        var res = read.call(result, sgn * state.peek());
    //
    //        // when state became zero, next eval won't execute
    //        // until some other dependency is changed
    //        if (state.peek() < count - 1)
    //            state(state() + 1);
    //
    //        else state = state(0);
    //
    //        return isUndefined(res) ? result.peek() : res;
    //    });
    //
    //    return result;
    //});
};

// when a nexable is returned from some computed context
// all states created in that computed context will be bounded
// to the returning nexable
