import "./math";
import "./astro";
import "./weekday";
import "./time";
import "./parse";

var JMJD = 2400000.5;
function toJMD(j) {
    return j - JMJD;
}
