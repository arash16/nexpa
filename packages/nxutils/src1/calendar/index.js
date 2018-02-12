var JulianDate = (function () {
	import "../generic/base";
	import "../generic/strings";
	import "../generic/numbers";

    import "./utils";
    import "./julian";
    import "./gregorian";
    import "./islamic";
    import "./persian";

    var calendars = {
        'julian': [
            jd_to_julian,
            julian_to_jd,
            leap_julian,
            GREGORIAN_WEEKDAYS,
            GREGORIAN_MONTH,
            0
        ],
        'gregorian': [
            jd_to_gregorian,
            gregorian_to_jd,
            leap_gregorian,
            GREGORIAN_WEEKDAYS,
            GREGORIAN_MONTH,
            0
        ],
        'islamic': [
            jd_to_islamic,
            islamic_to_jd,
            leap_islamic,
            ISLAMIC_WEEKDAYS,
            ISLAMIC_MONTH,
            6
        ],
        'persian': [
            jd_to_persian,
            persian_to_jd,
            leap_persian,
            PERSIAN_WEEKDAYS,
            PERSIAN_MONTHS,
            6,
            parsePersianDate
        ]
    };

    function parseDate(date) {
        if (isString(date)) date = Date.parse(date);
        if (isNumber(date)) date = new Date(date);
        return date;
    }

    function fromMeta(cal, year, month, day) {
        if (isObject(year)) {
            if (year instanceof JulianDate)
                return new JulianDate(year, cal);

            day = year.day;
            month = year.month;
            year = year.year;
        }

        if (!month) {
            month = 12;
            year--;
        }
        else if (month == 13) {
            month = 1;
            year++;
        }

        var jd = calendars[cal][1](year, month, day);
        return new JulianDate(jd, cal);
    }


    var defaultCalendar = 'persian',
        cachedDates = {};

    function JulianDate(jd, calendar) {
        if (!calendars[calendar])
            calendar = jd && calendars[jd.calendar] ? jd.calendar : defaultCalendar;

        if (jd instanceof JulianDate && jd.calendar == calendar) return jd;
        else if (jd && +jd.jd) jd = +jd.jd;
        else {
            if (isString(jd)) jd = parseDate(jd);
            if (jd instanceof Date)
                jd = gregorian_to_jd(jd.getFullYear(), jd.getMonth(), jd.getDate())
                    + floor(jd.getSeconds() + 60 * jd.getMinutes() + 3600 * jd.getHours() + 0.5) / 86400.0;

            if (isUndefined(jd)) {
                jd = new Date();
                jd = gregorian_to_jd(jd.getFullYear(), jd.getMonth(), jd.getDate());
            }
        }

        if (!isNumber(jd))
            return { jd: null };

        if (jd < JMJD) jd += JMJD;
        jd = round(jd * 1e8) / 1e8;


        var jmd = toJMD(jd),
            cache = cachedDates[calendar];
        if (cache[jmd]) return cache[jmd];

        var cal = calendars[calendar],
            meta = cal[0](jd),
            result = this;

        result.calendar = calendar;
        result.jd = jd;
        result.year = meta[0];
        result.month = meta[1];
        result.day = meta[2];
        result.days = undefined;
        result.weekday = jwDay(jd);

        // only cache dates without time (no fractional part)
        if (jmd | 0 === jmd)
            cache[jmd] = result;

        return result;
    }

    JulianDate.prototype = {
        getTime: function () {
            var res = jhms(this.jd);
            return {
                hour: res[0],
                min: res[1],
                sec: res[2]
            };
        },
        getWeekday: function () {
            return Weekdays[this.weekday];
        },
        toString: function (cal) {
            var res = this.calendar == cal ? this : new JulianDate(this, cal);
            return res.year + '-' + res.month + '-' + res.day;
        },
        toLongString: function () {
            return this.day + ' ' +
                calendars[this.calendar][4][this.month - 1] + ' ' +
                this.year;
        },
        toFullString: function () {
            var weekdays = calendars[this.calendar][3],
                months = calendars[this.calendar][4];

            return weekdays[this.weekday] + ' ،  ' +
                this.day + '  ' +
                months[this.month - 1] + '  ' +
                this.year;
        },
        toJSON: function () {
            return { jd: this.jd, calendar: this.calendar };
        },
        isEqualTo: function isEqualTo(other) {
            return other && this === new JulianDate(other, this.calendar);
        },

        setDay: function (day) {
            return this.day == day ? this :
                   fromMeta(this.calendar, this.year, this.month, day);
        },
        plusDays: function (days) {
            return this.setDay(this.day + days);
        },
        setMonth: function (month) {
            return this.month == month ? this :
                   fromMeta(this.calendar, this.year, month, this.day);
        },
        plusMonths: function (month) {
            return this.setMonth(this.month + month);
        },
        setYear: function (year) {
            return this.year == year ? this :
                   fromMeta(this.calendar, year, this.month, this.day);
        },
        plusYears: function (year) {
            return this.setYear(this.year + year);
        },
        setParts: function (year, month, day) {
            return fromMeta(
                this.calendar,
                +year || this.year,
                isNumber(month) ? month : this.month,
                isNumber(day) ? day : this.day
            );
        },
        plusParts: function (years, months, days) {
            return fromMeta(
                this.calendar,
                this.year + (years | 0),
                this.month + (months | 0),
                this.day + (days | 0)
            );
        },

        minus: function (other) {
            return this.jd - (other.jd || other);
        },
        totalDays: function () {
            return this.days = this.days || fromMeta(this.calendar, this.year, this.month + 1, 0).day;
        }
    };


    JulianDate.calendars = {};
    eachKey(calendars, function (cal, convs) {
        cachedDates[cal] = {};

        JulianDate.prototype[camelCase('to-' + cal)] = function () {
            return new JulianDate(this, cal);
        };

        JulianDate[camelCase('from-' + cal)] = function (year, month, day) {
            return fromMeta(cal, year, month, day);
        };

        JulianDate.calendars[cal] = {
            parse: convs[6],
            toJd: convs[1],
            formJd: convs[0],
            isLeap: convs[2],
            months: convs[4],
            weekdays: convs[3],
            firstWeekday: convs[5]
        };
    });

    JulianDate.parse = function (s) {
        return s instanceof JulianDate ? s :
               JulianDate.calendars[defaultCalendar].parse(s);
    }

    return JulianDate;
})();
