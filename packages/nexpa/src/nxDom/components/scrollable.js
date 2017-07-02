var scrollableScreenOverlay;

function enableScreenOverlay() {
    if (!scrollableScreenOverlay) {
        scrollableScreenOverlay = document.createElement('div');
        scrollableScreenOverlay.classList.add('scrolling-overlay');
        document.body.appendChild(scrollableScreenOverlay);
        scrollableScreenOverlay.hide = function dispose() {
            scrollableScreenOverlay.style.display = '';
        };
    }
    scrollableScreenOverlay.style.display = 'block';
    return scrollableScreenOverlay;
}


function toPixel(val) {
    var res = parseFloat(val);
    if (!isNaN(res)) return res + 'px';
}

el.defineComponent('scrollable', function (props, childs) {
    var scrollHeight = parseFloat(props.height || props.maxHeight),
        childsNx = nx(function () {
            nx.afterNext(calcScrollableBar);
            childs.count();
            return unwrap(childs);
        }),
        contentEl = <div>{ childsNx }</div>,
        isDragging = nx(false),
        barTop = nx('0px'),
        barBottom = nx('0px'),
        styles = {
            maxHeight: toPixel(scrollHeight),
            height: toPixel(props.height)
        },
        contentContainerEl = <div class="content" style={styles} onwheel={onWheel} onscroll={onMouseUp}
                                  ontouchstart={onTouchStart} ontouchmove={onTouchMove}>{contentEl}</div>;


    function calcScrollableBar(newValue) {
        var ccn = contentContainerEl.getNode(),
            sh = ccn.scrollHeight,
            oh = ccn.offsetHeight,
            sTop = ccn.scrollTop;

        if (isNumber(newValue)) {
            ccn.scrollTop = newValue;
            var result = ccn.scrollTop !== sTop;
        }

        var progress = sh == oh ? 0 : ccn.scrollTop / (sh - oh),
            bh = (oh - 12) * (oh / sh),
            bt = progress * (oh - bh - 12),
            bb = oh - bt - bh - 12;

        if (parseInt(bt + bh + bb + 12) == oh) {
            barTop(bt | 0);
            barBottom(bb | 0);
        }

        if (result) {
            var ev = document.createEvent('MouseEvent');
            ev.initEvent('scroll', true, true);
            global.dispatchEvent(ev);
        }
        return result;
    }

    var inCheck = false;

    function onMouseUp() {
        if (inCheck) return;

        var node = this,
            lastCnHeight;

        inCheck = true;
        nx.onSignal(function () {
            inCheck = false;
            var nh = node.offsetHeight;
            if (calcScrollableBar() || lastCnHeight !== nh) {
                lastCnHeight = nh;
                nx.repeatLater();
                inCheck = true;
            }
        });
    }

    function startDragging(e) {
        var startS = this.parentElement.previousElementSibling.scrollTop,
            startY = e.screenY,
            overlay = enableScreenOverlay(),
            h2 = addListener(overlay, 'mouseup', endScrolling),
            h1 = addListener(overlay, 'mousemove', function (e) {
                if (e.button || e.buttons !== 1)
                    return endScrolling();

                calcScrollableBar(startS + (e.screenY - startY));
                return stopPropagation(e, true);
            });

        function endScrolling() {
            removeListener(overlay, 'mousemove', h1);
            removeListener(overlay, 'mouseup', h2);
            isDragging(false);
            overlay.hide();
        }

        isDragging(true);
        return stopPropagation(e, true);
    }


    function onWheel(e) {
        var delta = (e.deltaY > 0 ? 1 : -1) * 50;
        if (calcScrollableBar(this.scrollTop + delta))
            return stopPropagation(e, true);
    }

    var activeTouch, preTop;

    function onTouchStart(e) {
        activeTouch = e.touches[0];
        preTop = this.scrollTop;
    }

    function onTouchMove(e) {
        for (var t, i = 0; (t = e.changedTouches[i]) && t.identifier !== activeTouch.identifier; i++);
        if (!t)return;

        var delta = activeTouch.screenY - t.screenY;
        if (calcScrollableBar(preTop + delta))
            return stopPropagation(e, true);
    }

    var barStyles = nx(function () {
            return {
                top: barTop() + 'px',
                bottom: barBottom() + 'px'
            };
        }),
        result = <div class={'scrollable' + (isDragging() ? ' active' : '')}>
            {contentContainerEl}
            <div class="bar-container">
                <div class={'bar' + (!barTop() && !barBottom() ? ' hide' : '')} style={barStyles} onmousedown={startDragging}></div>
            </div>
        </div>;

    result.refresh = function () { onMouseUp.call(contentContainerEl.getNode()); };
    return result;
});
