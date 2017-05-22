if ("isClient") {
    var animated = (function () {
        import "./easings";
        import "./animated";
        return animated;
    })();
}
else {
    function animated(startValue, endValue, time, easing) {
        var val = arguments.length < 4 && (!time || easings[time]) ? startValue : endValue;
        return nx(() => unwrap(val));
    }
}
