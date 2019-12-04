var reValueParts = /^([+-]?[0-9]*(?:\.[0-9]+)?(?:e[+-]?[0-9]+)?)(.*)/i;

function animated(startValue, endValue, time, easing) {
    if (arguments.length < 4 && (!time || easings[time]))
        if (isNexable(startValue))
            return animatedNx(startValue, endValue, time);
        else if (isFunc(startValue))
            return animatedNx(nx(startValue), endValue, time);

    startValue = unwrap(startValue);
    endValue = unwrap(endValue);
    time = unwrap(time);
    easing = unwrap(easing);

    var startParts = reValueParts.exec(startValue),
        endParts = reValueParts.exec(endValue),
        unit = endParts[2] || startParts[2] || 0,

        startTime = Date.now(),
        duration = toFloat(time, 1000) * (isString(time) && time.endsWith('s') ? 1000 : 1),

        easeFn = isFunc(easing) ? easing : easings[easing] || easings.default;

    startValue = parseFloat(startParts[1]) || 0;
    endValue = parseFloat(endParts[1]) || 0;

    var passedTime = nx(function () {
        var result = nx.now.peek() - startTime >= duration ? duration :
                     nx.now() - startTime;
        return result < 0 ? 0 : result;
    });

    return nx(function () {
        var p = passedTime();
        return (p >= duration
                ? endValue
                : startValue + easeFn(p / duration) * (endValue - startValue))
            + unit;
    });
}

function animatedNx(nxEnd, time, easing) {
    var firstEnd, lastEnd, animator;

    return nx(function () {
        var newEnd = unwrap(nxEnd);

        if (isUndefined(firstEnd) && !isUndefined(newEnd))
            firstEnd = newEnd;

        if (isUndefined(lastEnd))
            return lastEnd = newEnd;

        if (isUndefined(newEnd))
            newEnd = firstEnd;

        if (newEnd !== lastEnd || !animator) {
            var current = animator ? animator.peek() : lastEnd,
                total = newEnd - lastEnd,
                remain = newEnd - current;

            animator = animated(current, newEnd, (remain / total) * time, easing);
            lastEnd = newEnd;
        }

        var result = animator();
        if (result === newEnd)
            animator = null;
        return result;
    });
}
