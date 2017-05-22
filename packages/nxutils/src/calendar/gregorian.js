var GREGORIAN_EPOCH = 1721425.5,
    GREGORIAN_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    GREGORIAN_MONTH = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];

function leap_gregorian(year) {
    return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}

function gregorian_to_jd(year, month, day) {
    return GREGORIAN_EPOCH - 1 + 365 * (year - 1)
        + floor((year - 1) / 4)
        - floor((year - 1) / 100)
        + floor((year - 1) / 400)
        + floor(
            (367 * month - 362) / 12 + day
            + (month <= 2 ? 0 : leap_gregorian(year) ? -1 : -2)
        );
}

function jd_to_gregorian(jd) {
    var wjd = floor(jd - 0.5) + 0.5,
        depoch = wjd - GREGORIAN_EPOCH,
        dqc = mod(depoch, 146097),
        cent = floor(dqc / 36524),
        dCent = mod(dqc, 36524),
        dQuad = mod(dCent, 1461),
        yIndex = floor(dQuad / 365),
        year = floor(depoch / 146097) * 400
            + cent * 100
            + floor(dCent / 1461) * 4
            + yIndex;

    if (cent != 4 && yIndex != 4)
        year++;

    var yearDay = wjd - gregorian_to_jd(year, 1, 1),
        leapAdj = wjd < gregorian_to_jd(year, 3, 1) ? 0 : leap_gregorian(year) ? 1 : 2,
        month = floor(((yearDay + leapAdj) * 12 + 373) / 367),
        day = wjd - gregorian_to_jd(year, month, 1) + 1;

    return [year, month, day];
}
