(function () {
    var tooltipContainer = nx();
    registerGlobalElement(<div>{tooltipContainer}</div>);

    // because of automatic rtl-css,
    // here we need to swap it manually
    var classOrientSwap = {
        'top': 'top',
        'left': 'right',
        'right': 'left',
        'bottom': 'bottom'
    };

    var defaultStyles = {
        display: 'block',
        visibility: 'hidden',
        left: '0px',
        top: '0px'
    };

    el.defineBehavior('tooltip', function (elem, params) {
        var content = nx(() => tryStringify(unwrap(unwrap(params).content || params))),
            orient = nx(() => (unwrap(unwrap(params).orient) || 'top').toLowerCase()),
            isOpen = nx(false),
            leftDist = nx(0),
            topDist = nx(0),
            computedSize = nx(function () {
                if (!isVoid(unwrap(content)))
                    return tooltipElem.getOffsetSizes() || nx.repeatLater();
            }),
            classes = nx(function () {
                var clsOrient = classOrientSwap[orient()] || 'top';
                return 'tooltip ' + clsOrient + (isOpen() ? ' in' : '');
            }),
            styles = nx(function () {
                if (!isOpen() || !(cs = computedSize()))
                    return styles.peek() || defaultStyles;

                var top = topDist(),
                    left = leftDist(),
                    ori = unwrap(orient),
                    cs;

                if (ori == 'top' || ori == 'bottom') left -= cs.width / 2;
                else top -= cs.height / 2;

                if (ori == 'top') top -= cs.height;
                else if (ori == 'left') left -= cs.width;

                return {
                    display: 'block',
                    visibility: 'visible',
                    left: (left | 0) + 'px',
                    top: (top | 0) + 'px'
                };
            }),
            tooltipElem = <div class={classes} style={styles} role="tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-inner">{content}</div>
            </div>;

        elem.addListener('mouseenter', function () {
            tooltipContainer(tooltipElem);

            var rect = elem.getAbsoluteOffsets();
            if (!rect) return;

            var ori = unwrap(orient),
                top = rect.top,
                left = rect.left;

            if (ori == 'top' || ori == 'bottom')
                left += rect.width / 2;
            else top += rect.height / 2;

            if (ori == 'bottom') top += rect.height;
            else if (ori == 'right') left += rect.width;

            topDist(top);
            leftDist(left);

            nx.afterNext(() => isOpen(true));
        });

        elem.addListener('mouseleave', function () {
            isOpen(false);
            if (tooltipContainer.peek() == tooltipElem)
                tooltipContainer(undefined);
        });
    });
})();
