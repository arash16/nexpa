if ("isClient") {
    var requestAnimationFrame = (function () {
        var timeLast = 0;
        return global.requestAnimationFrame
            || global.webkitRequestAnimationFrame
            || global.mozRequestAnimationFrame
            || function (callback) {
                var timeCurrent = (new Date()).getTime(),
                    timeDelta;

                /* Dynamically set delay on a per-tick basis to match 60fps. */
                /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
                timeDelta = max(0, 16 - (timeCurrent - timeLast));
                timeLast = timeCurrent + timeDelta;

                return setTimeout(function () { callback(timeCurrent + timeDelta); }, timeDelta);
            };
    })();


    var nextFrame = requestAnimationFrame;
}
else {
    function nextFrame(cb) { cb(); }
}
