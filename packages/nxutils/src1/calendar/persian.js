var PERSIAN_EPOCH = 1948320.5,
    PERSIAN_WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهار شنبه', 'پنج شنبه', 'جمعه', 'شنبه'],
    PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

function leap_persian(year) {
    return (((year - (year > 0 ? 474 : 473)) % 2820 + 512) * 682) % 2816 < 682;
}

function persian_to_jd(year, month, day) {
    var epBase = year - (year >= 0 ? 474 : 473),
        epYear = 474 + mod(epBase, 2820);

    return day + PERSIAN_EPOCH - 1
        + floor((epYear * 682 - 110) / 2816)
        + floor(epBase / 2820) * 1029983
        + (epYear - 1) * 365
        + (month <= 7 ?
           (month - 1) * 31 :
           (month - 1) * 30 + 6);
}

function jd_to_persian(jd) {
    jd = floor(jd) + 0.5;

    var depoch = jd - persian_to_jd(475, 1, 1),
        cYear = mod(depoch, 1029983);

    if (cYear == 1029982) yCycle = 2820;
    else {
        var aux1 = floor(cYear / 366),
            yCycle = floor((2134 * aux1 + 2816 * mod(cYear, 366) + 2815) / 1028522) + aux1 + 1;
    }

    var year = yCycle + 2820 * floor(depoch / 1029983) + 474;
    if (year <= 0) year--;

    var yDay = jd - persian_to_jd(year, 1, 1) + 1,
        month = yDay <= 186 ? ceil(yDay / 31) : ceil((yDay - 6) / 30),
        day = jd - persian_to_jd(year, month, 1) + 1;

    return [year, month, day];
}
