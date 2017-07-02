el.defineComponent('slider', function (props, childs) {
    function emitCall(fn) {
        if (isFunc(fn)) fn(resultEl);
    }

    var lastTarget, ever,
        targetVal = nx(() => unwrap(props.visible) ? 1 : 0),
        progress = nx.animated(nx(function () {
            var newTarget = targetVal(),
                prevState = +progress.peek();

            if (isUndefined(lastTarget) || isNaN(prevState));
            else if (prevState === lastTarget)
                if (lastTarget === newTarget) {
                    if (ever) {
                        emitCall(newTarget ? props.onOpened : props.onClosed);
                        ever = false;
                    }
                    return lastTarget;
                }
                else {
                    var rev = resultEl.computedStyles.rev;
                    rev(rev.peek() + 1);
                    emitCall(newTarget ? props.onOpen : props.onClose);
                    ever = true;
                }

            nx.repeatLater();
            return lastTarget = newTarget;
        }), props.duration || 500),
        openValues = nx(() => resultEl.getStyle('height,paddingTop,paddingBottom', 0).map(x => parseInt(x) | 0)),
        animatedStyles = nx(function () {
            var p = parseFloat(progress());
            if (p !== 1 && p)
                var rvs = openValues(),
                    res = {
                        overflowY: 'hidden',
                        height: (rvs[0] * p) + 'px',
                        paddingTop: (rvs[1] * p) + 'px',
                        paddingBottom: (rvs[2] * p) + 'px'
                    };
            return defaults(res, props.style);
        }),
        resultEl = el(props.tag || 'div', defaults({ style: animatedStyles }, props), childs),
        result = nx(() => progress() ? resultEl : void 0);

    result.progress = progress;
    return result;
});
