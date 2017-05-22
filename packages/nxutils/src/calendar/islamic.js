var ISLAMIC_EPOCH = 1948439.5,
    ISLAMIC_WEEKDAYS = ['أَحَد', 'إثْنَان', 'ثلاثاء', 'أربعاء', 'خمیس', 'الجمعة', 'سبت'],
    ISLAMIC_MONTH = ['محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذیقعده', 'ذیحجه'];

function leap_islamic(year) {
    return (year * 11 + 14) % 30 < 11;
}

function islamic_to_jd(year, month, day) {
    return day + ISLAMIC_EPOCH - 1
        + ceil(29.5 * (month - 1))
        + floor((3 + (11 * year)) / 30)
        + (year - 1) * 354;
}

function jd_to_islamic(jd) {
    jd = floor(jd) + 0.5;
    var year = floor((30 * (jd - ISLAMIC_EPOCH) + 10646) / 10631),
        month = min(12, ceil((jd - 29 - islamic_to_jd(year, 1, 1)) / 29.5) + 1),
        day = jd - islamic_to_jd(year, month, 1) + 1;

    return [year, month, day];
}
