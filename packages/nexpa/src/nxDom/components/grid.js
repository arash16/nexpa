el.defineComponent('grid', function (props, childs) {
    var columns = nx(function () { return toInteger(props.columns, 1); }),
        colWidth = nx(function () { return toInteger(12 / columns()); }),
        lastColW = nx(function () { return colWidth() * (1 - columns()) + 12; });

    var blocks = nx(function () {
        var bloCnt = childs.count(),
            result = (blocks.peek() || []).slice(0, bloCnt);

        for (var i = result.length; i < bloCnt; i++) (function (i) {
            var colClass = nx(function () {
                    var cols = columns(),
                        pref = 'col-' + (cols < 4 ? 'md' : 'lg') + '-';

                    return pref + (i % cols == cols - 1 ? lastColW() : colWidth());
                });

            result.push(<div class={colClass}>{unwrap(childs)[i]}</div>);
        })(i);

        return result;
    });

    return <div class="row">{blocks}</div>;
});
