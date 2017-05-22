function jwDay(j) {
    return mod(floor(j + 1.5), 7);
}



/*  WEEKDAY_BEFORE  --  Return Julian date of given weekday (0 = Sunday)
 in the seven days ending on jd.  */

function weekday_before(weekday, jd) {
    return jd - jwDay(jd - weekday);
}

/*  SEARCH_WEEKDAY  --  Determine the Julian date for:

 weekday      Day of week desired, 0 = Sunday
 jd           Julian date to begin search
 direction    1 = next weekday, -1 = last weekday
 offset       Offset from jd to begin search
 */

function search_weekday(weekday, jd, direction, offset) {
    return weekday_before(weekday, jd + direction * offset);
}

//  Utility weekday functions, just wrappers for search_weekday

function nearest_weekday(weekday, jd) {
    return search_weekday(weekday, jd, 1, 3);
}

function next_weekday(weekday, jd) {
    return search_weekday(weekday, jd, 1, 7);
}

function next_or_current_weekday(weekday, jd) {
    return search_weekday(weekday, jd, 1, 6);
}

function previous_weekday(weekday, jd) {
    return search_weekday(weekday, jd, -1, 1);
}

function previous_or_current_weekday(weekday, jd) {
    return search_weekday(weekday, jd, 1, 0);
}
