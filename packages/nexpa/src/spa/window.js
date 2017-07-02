var nxWindow = nx.run(function () {
    function check() {
        fragment(global.location.hash.replace(routeStripper, ''));
    }

    var routeStripper = /^#?[\/\\]*/,
        fragment = nx(),
        activeHash = nx(
            () => fragment(),
            (newHash) => global.location.hash = newHash.replace(routeStripper, '')
        );
    addListener(global, 'hashchange', check() || check);

    // ----------------------------------------------------------------------------------------

    var baseTitle = global.document.title,
        nxTitle = nx(''),
        title = nx(() => unwrap(nxTitle), newVal => {
            newVal = unwrap(newVal);
            global.document.title = (newVal && baseTitle ? newVal + ' - ' : '') + baseTitle;
            nxTitle(newVal);
        });

    // ----------------------------------------------------------------------------------------

    function scroll(x, y) {
        global.scroll(toInteger(x), toInteger(y));
    }


    var workingMethod,
        scrollCalcMethods = [
            function () {
                return [global.scrollX, global.scrollY];
            },
            function () {
                return [global.pageXOffset, global.pageYOffset];
            },
            (function () {
                var t = document.documentElement || document.body.parentNode;
                if (!isNumber(t.ScrollLeft)) t = document.body;
                return function () {
                    return [t.ScrollLeft, t.scrollTop];
                };
            })()
        ];

    function updateScroll() {
        if (workingMethod) xyo = workingMethod();
        else for (var i = 0; !workingMethod && i < 3; i++) {
            var method = scrollCalcMethods[i],
                xyo = method();

            if (isNumber(xyo[0]))
                workingMethod = method;
        }

        xOffset(xyo[0]);
        yOffset(xyo[1]);
    }

    var xOffset = nx.state(),
        yOffset = nx.state(),
        scrollX = nx.computed(xOffset, newVal => scroll(newVal, global.pageYOffset)),
        scrollY = nx.computed(yOffset, newVal => scroll(global.pageXOffset, newVal));
    addListener(global, 'scroll', updateScroll() || updateScroll);

    // ----------------------------------------------------------------------------------------

    function updateSize() {
        pageWidth((global.innerWidth || global.outerWidth) | 0);
        pageHeight((global.innerHeight || global.outerHeight) | 0);
    }

    var pageWidth = nx.state(),
        pageHeight = nx.state();
    addListener(global, 'resize', updateSize() || updateSize);

    // ----------------------------------------------------------------------------------------

    return {
        activeHash: activeHash,
        title: title,
        scroll: scroll,
        scrollX: scrollX,
        scrollY: scrollY,
        width: () => pageWidth(),
        height: () => pageHeight()
    };
});
