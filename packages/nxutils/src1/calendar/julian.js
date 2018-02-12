var JULIAN_EPOCH = 1721423.5;

function leap_julian(year) {
    return mod(year, 4) == (year > 0 ? 0 : 3);
}

function julian_to_jd(year, month, day) {
    if (year < 1) year++;

    if (month <= 2) {
        year--;
        month += 12;
    }

    return floor(365.25 * (year + 4716))
        + floor(30.6001 * (month + 1))
        + day - 1524.5;
}

function jd_to_julian(td) {
    var b = floor(td += 0.5) + 1524,
        c = floor((b - 122.1) / 365.25),
        d = floor(365.25 * c),
        e = floor((b - d) / 30.6001),
        month = floor(e < 14 ? e - 1 : e - 13),
        year = floor(month > 2 ? c - 4716 : c - 4715),
        day = b - d - floor(30.6001 * e);

    return [year - ((year < 1) | 0), month, day];
}
