(function () {
    var animationPrefix = 'animation-fadeIn',
        tablesClass = 'table-condensed ' + animationPrefix + 'Quick',
        fromPersian = JulianDate.fromPersian,
        calendar = JulianDate.calendars.persian,
        months = calendar.months,
        weekdays = calendar.weekdays,
        weekOffset = calendar.firstWeekday;

    defineView('calendar', function (contexts) {
        var ctx = this,
            activePage = nx(false),
            dActiveMonth = nx.state(new JulianDate().setDay(1)),
            activeMonth = nx(() => {
                var d = ctx.valueOf();
                if (d) return d.setDay(1);
            }),
            elementName = String(getProp(contexts, 'name', 2) || '') || undefined,
            elementId = String(getProp(contexts, 'id', 2) || elementName || '') || ('input_' + ctx.vid),
            visibleValue = nx(),
            notify = true;

        function resetActiveMonth() {
            var dd = activeMonth();
            if (dd) dActiveMonth(dd);
        }

        function onInput(ev) {
            var target = ev.target,
                current = ctx.toString(),
                rawNewVal = target.value;

            if (valEqual(rawNewVal, current, true)) return;

            notify = false;
            ctx.assign(rawNewVal);
            notify = true;

            visibleValue(rawNewVal);
        }

        function onChange(ev) {
            onInput(ev);
            notify = true;
            visibleValue(undefined);
        }

        var clickEventHandler,
            nxElementValue = nx(function () {
                var v = visibleValue();
                return isUndefined(v) ? ctx.toString() : v;
            }),
            inputElm = <input type="text" name={elementName} id={elementId} placeholder="yyyy-mm-dd"
                              class="form-control font-en" style={{ direction: 'ltr', textAlign: 'left'}}
                              onchange={onChange} oninput={onInput}
                              value={nxElementValue}/>;

        // ---------------------------------------------------------------------------------------------------------------------------------

        function openDropdown() {
            inputElm.focus();
            if (clickEventHandler) return;

            var node = this;
            clickEventHandler = addListener(document, 'mousedown', function (e) {
                if (!node.contains(e.target) && !sliderDiv.render.peek().contains(e.target))
                    closeDropdown();
            });

            spa.activatePopup(sliderDiv);
            resetActiveMonth();
            nx.afterNext(() => activePage(0));
        }

        function closeDropdown() {
            removeListener(document, 'mousedown', clickEventHandler);
            activePage(clickEventHandler = false);
        }

        nx.run(function () {
            resetActiveMonth();
            if (notify) visibleValue(undefined);
            else notify = true;
            inputElm.focus();
        });

        var started,
            isActive = nx(() => started = activePage() !== false),
            orient = nx(function () {
                if (!isActive()) return orient.peek() || 'top';
                var viewMiddleLine = spa.window.scrollY() + spa.window.height() / 2 + 30;
                return inpGroup.absoluteOffsets().top > viewMiddleLine ? 'bottom' : 'top';
            }),
            dropdownStyles = nx(function () {
                var offs = inpGroup.absoluteOffsets(),
                    ori = orient();
                return {
                    top: ori == 'top' ? (offs.top + offs.height) + 'px' : 'auto',
                    bottom: ori == 'bottom' ? (document.body.clientHeight - offs.top) + 'px' : 'auto',
                    left: offs.left + 'px'
                };
            }),
            dropdownClasses = nx(2, function (step) {
                return 'dropdown-menu datepicker datepicker-dropdown datepicker-orient-' + orient()
                    + (isActive() ? ' active' : '');
            }),
            dropdownPages = [
                dayPickerTable(ctx, dActiveMonth, activePage),
                monthPickerTable(activeMonth, dActiveMonth, activePage),
                yearPickerTable(activeMonth, dActiveMonth, activePage)
            ],
            longFormat = nx(function () {
                var result = ctx.read();
                return result ? result.toFullString() : '';
            });


        var todayDt = new JulianDate(),
            todayStr = 'امروز :  ' + todayDt.toFullString(),
            todayTooltip = {
                orient: 'right',
                content: toAllCalendarsString(todayDt)
            },
            todayClick = function () {
                activePage(0);
                ctx.assign(todayDt);
                resetActiveMonth();
            },
            onOpen = false,
            todayStyles = nx(function () {
                var p = sliderDropdown.progress() || 0,
                    delay = 0.3;

                if (started || p < delay) {
                    started = false;
                    return {
                        width: 0,
                        paddingLeft: 0,
                        paddingRight: 0
                    };
                }

                p = (p - delay) / (1 - delay);
                var pad = 15 * p + 'px';

                return {
                    width: 211 * p + 'px',
                    paddingLeft: pad,
                    paddingRight: pad,
                    visibility: 'visible'
                };
            });


        var sliderDropdown = <slider duration="300" visible={isActive} onClosed={() => spa.deactivatePopup(sliderDiv)}>
            <div>
                {nx(() => dropdownPages[activePage() | 0])}
                <div class="today" tooltip={todayTooltip}
                     onclick={todayClick}
                     style={todayStyles}>{todayStr}</div>
            </div>
        </slider>;
        var sliderDiv = <div class={dropdownClasses} style={dropdownStyles}>{sliderDropdown}</div>;

        var inpGroup = <div class="input-group" onclick={openDropdown}>
            {inputElm}
            <div class="text-overlay">{longFormat}</div>
            <div class="input-group-addon"><Icon id="calendar"/></div>
        </div>;

        return inpGroup;
    });


    // -------------------------------------------------------------------------------------------------------------------------------------

    function toAllCalendarsString(dt) {
        return dt.toFullString() + '\n'
            + dt.toIslamic().toFullString() + '\n'
            + dt.toGregorian().toFullString();
    }

    function dayPickerTable(ctx, dActiveMonth, activePage) {
        var animationOrient = nx(),
            animationClass = animatorClass(animationOrient, activePage);

        function addMonths(months) {
            animationOrient(months > 0 ? 'Left' : 'Right');
            dActiveMonth(dActiveMonth().plusMonths(months));
        }

        var weekHeaders = weekdays.map(function (n, ind, arr) {
            var nameShort = arr[(weekOffset + ind) % 7].substring(0, 1);
            return <th class="dow">{nameShort}</th>;
        });

        var bodyRows = new Array(6);
        for (var i = 0; i < 6; i++) {
            var row = new Array(7);
            for (var j = 0; j < 7; j++)
                row[j] = (function (offset) {
                    var dayNx = nx(function () {
                            var dt = dActiveMonth();
                            return dt.plusDays(offset - (weekOffset + dt.weekday) % 7);
                        }),
                        classes = nx(function () {
                            var date = dayNx();
                            return (date.month < dActiveMonth().month ? 'old ' :
                                    date.month > dActiveMonth().month ? 'new ' : '')
                                + 'day'
                                + (date.isEqualTo(ctx.read()) ? ' active' : '');
                        }),
                        dayTooltip = nx(function () {
                            var dt = dayNx();
                            return {
                                orient: 'top',
                                content: toAllCalendarsString(dt)
                            };
                        });

                    return <td class={classes} onclick={() => ctx.assign(dayNx())} tooltip={dayTooltip}>
                        {dayNx().day}
                    </td>;
                })(7 * i + j);

            bodyRows[i] = <tr>{row}</tr>;
        }

        var prevTooltip = nx(function () {
                var pm = dActiveMonth().month - 2,
                    py = dActiveMonth().year;

                if (pm < 0) pm += 12, py--;
                return {
                    orient: 'right',
                    content: months[pm] + ' ' + py
                };
            }),
            nextTooltip = nx(function () {
                var pm = dActiveMonth().month,
                    py = dActiveMonth().year;

                if (pm >= 12) pm -= 12, py++;
                return {
                    orient: 'left',
                    content: months[pm] + ' ' + py
                };
            });

        return <table class={tablesClass}>
            <thead>
                <tr>
                    <th class="prev" onclick={() => addMonths(-1)} tooltip={prevTooltip}>«</th>
                    <th colSpan="5" onclick={() => activePage(1)}>
                        <div class={animationClass}>
                            {months[dActiveMonth().month - 1] + ' ' + dActiveMonth().year}
                        </div>
                    </th>
                    <th class="next" onclick={() => addMonths(1)} tooltip={nextTooltip}>»</th>
                </tr>
                <tr class="separator">
                    <th colSpan="7"></th>
                </tr>
                <tr class={animationClass}>{weekHeaders}</tr>
            </thead>
            <tbody class={animationClass}>
                <tr class="separator">
                    <td colSpan="7"></td>
                </tr>
                {bodyRows}
            </tbody>
        </table>;
    }


    // ------------------------------------------------------------------------------------------------------


    function monthPickerTable(activeMonth, dActiveMonth, activePage) {
        var animationOrient = nx(),
            animationClass = animatorClass(animationOrient, activePage);

        function addYear(years) {
            animationOrient(years > 0 ? 'Left' : 'Right');
            dActiveMonth(dActiveMonth().plusYears(years));
        }

        var spans = new Array(12);
        for (var i = 0; i < 12; i++)
            spans[i] = function (m, title) {
                var month = nx(() => dActiveMonth().setMonth(m)),
                    classes = nx(() => 'month' + (month().isEqualTo(activeMonth()) ? ' active' : ''));

                function onClickHandler() {
                    dActiveMonth(month());
                    activePage(0);
                }

                return <span class={classes} onclick={onClickHandler}>{title}</span>;
            }(i + 1, months[i]);

        return <table class={tablesClass}>
            <thead>
                <tr>
                    <th class="prev" onclick={() => addYear(-1)} tooltip={{orient:'right', content: dActiveMonth().year - 1}}>«</th>
                    <th colSpan="5" onclick={() => activePage(2)}>
                        <div class={animationClass}>{dActiveMonth().year}</div>
                    </th>
                    <th class="next" onclick={() => addYear(1)} tooltip={{orient:'left', content: dActiveMonth().year + 1}}>»</th>
                </tr>
                <tr class="separator">
                    <th colSpan="7"></th>
                </tr>
            </thead>
            <tbody class={animationClass}>
                <tr>
                    <td colSpan="7">{spans}</td>
                </tr>
            </tbody>
        </table>;
    }


    // -------------------------------------------------------------------------------------------------------------------------------------


    function yearPickerTable(activeMonth, dActiveMonth, activePage) {
        var animationOrient = nx(),
            animationClass = animatorClass(animationOrient, activePage);

        var offsetYear = nx(() => {
                var ay = dActiveMonth().year,
                    sy = ((ay / 10) | 0) * 10;

                return sy + (sy + 10 == ay ? 9 : -1);
            }),
            activeYear = nx(() => {
                var am = activeMonth();
                return am && am.setMonth(1);
            });

        function addYears(years) {
            animationOrient(years > 0 ? 'Left' : 'Right');
            dActiveMonth(dActiveMonth().plusYears(years));
        }

        var spans = new Array(12);
        for (var i = 0; i < 12; i++)
            spans[i] = function (i) {
                var year = nx(() => dActiveMonth().setParts(offsetYear() + i, 1, 1)),
                    classes = nx(() =>
                        'year'
                        + (!i ? ' old' : i == 11 ? ' new' : '')
                        + (year().isEqualTo(activeYear()) ? ' active' : '')
                    );

                function onClickHandler() {
                    dActiveMonth(dActiveMonth().setYear(year().year));
                    activePage(1);
                }

                return <span class={classes} onclick={onClickHandler}>{year().year}</span>;
            }(i);

        return <table class={tablesClass}>
            <thead>
                <tr>
                    <th class="prev" onclick={() => addYears(-10)}>«</th>
                    <th colSpan="5">
                        <div class={animationClass}>
                            {(offsetYear() + 1) + ' - ' + (offsetYear() + 10)}
                        </div>
                    </th>
                    <th class="next" onclick={() => addYears(10)}>»</th>
                </tr>
                <tr class="separator">
                    <th colSpan="7"></th>
                </tr>
            </thead>
            <tbody class={animationClass}>
                <tr>
                    <td colSpan="7">{spans}</td>
                </tr>
            </tbody>
        </table>;
    }


    // -------------------------------------------------------------------------------------------------------------------------------------


    function animatorClass(orient, activePage) {
        nx.run(function () {
            activePage();
            orient(null);
        });

        var lastAssigned = '';
        return nx(function (step) {
            var newAssigned = orient();
            if (newAssigned) {
                lastAssigned = animationPrefix + newAssigned;
                orient('');
                return 'invisible';
            }

            newAssigned = lastAssigned;
            lastAssigned = '';
            return newAssigned || '';
        });
    }
})();
