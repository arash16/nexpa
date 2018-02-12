/*  TEHRAN_EQUINOX  --  Determine Julian day and fraction of the
 March equinox at the Tehran meridian in
 a given Gregorian year.  */

function tehran_equinox(year) {
    var equJED = equinox(year, 0);
    return equJED
        - deltaT(year) / (24 * 60 * 60)
        + equationOfTime(equJED)
        + (52 + 30 / 60.0) / 360;
}


/*  TEHRAN_EQUINOX_JD  --  Calculate Julian day during which the
 March equinox, reckoned from the Tehran
 meridian, occurred for a given Gregorian
 year.  */

function tehran_equinox_jd(year) {
    return floor(tehran_equinox(year));
}

/*  PERSIANA_YEAR  --  Determine the year in the Persian
 astronomical calendar in which a
 given Julian day falls.  Returns an
 array of two elements:

 [0]  Persian year
 [1]  Julian day number containing
 equinox for this year.
 */

function persiana_year(jd) {
    var guess = jd_to_gregorian(jd)[0] - 2;

    for (var lastEq = tehran_equinox_jd(guess); lastEq > jd;)
        lastEq = tehran_equinox_jd(--guess);

    for (var nextEq = lastEq - 1; lastEq > jd || jd >= nextEq;) {
        lastEq = nextEq;
        nextEq = tehran_equinox_jd(++guess);
    }

    return [
        round((lastEq - PERSIAN_EPOCH) / TropicalYear) + 1,
        lastEq
    ];
}

function jd_to_persiana(jd) {
    var adr = persiana_year(jd = floor(jd) + 0.5),
        year = adr[0],
        yDay = floor(jd) - persiana_to_jd(year, 1, 1) + 1,
        month = (yDay <= 186) ? ceil(yDay / 31) : ceil((yDay - 6) / 30),
        day = floor(jd) - persiana_to_jd(year, month, 1) + 1;

    return [year, month, day];
}

function persiana_to_jd(year, month, day) {
    var guess = PERSIAN_EPOCH - 1 + TropicalYear * (year - 2),
        adr = [year - 1, 0];

    while (adr[0] < year) {
        adr = persiana_year(guess);
        guess = adr[1] + (TropicalYear + 2);
    }

    return adr[1] + day - 1
        + (month <= 7 ?
           (month - 1) * 31 :
           (month - 1) * 30 + 6);
}

function leap_persiana(year) {
    return persiana_to_jd(year + 1, 1, 1) - persiana_to_jd(year, 1, 1) > 365;
}
