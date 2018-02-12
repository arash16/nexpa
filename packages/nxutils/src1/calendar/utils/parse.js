var reDateString = /^(\d\d(?:\d\d)?)\W(11|12|0?[1-9])\W(30|31|[012]?\d)$/;
function parsePersianDate(dateString) {
    var res = reDateString.exec(dateString);
    if (!res) return;

    var year = parseInt(res[1]),
        month = parseInt(res[2]),
        day = parseInt(res[3]);

    if (year < 100) year = 1300 + year;
    if (year < 1000 || year > 1500) return;
    if (month > 6 && day > 30) return;
    if (!day) return;

    return JulianDate.fromPersian(year, month, day);
}
