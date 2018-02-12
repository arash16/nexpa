import { global } from '../is-x'

let requestAnimationFrame = (function () {
    let timeLast = 0;
    return global.requestAnimationFrame
        || global.webkitRequestAnimationFrame
        || global.mozRequestAnimationFrame
        || function (callback) {
            let timeCurrent = (new Date()).getTime();

            /* Dynamically set delay on a per-tick basis to match 60fps. */
            /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
            let timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
            timeLast = timeCurrent + timeDelta;

            return setTimeout(function () { callback(timeCurrent + timeDelta); }, timeDelta);
        };
})();

export const nextFrame = global.requestAnimationFrame = requestAnimationFrame;
