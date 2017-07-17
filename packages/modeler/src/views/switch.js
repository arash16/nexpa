defineView('switch', function () {
    var ctx = this;
    var caption = nx(function () {
        var cap = unwrap(ctx.caption);
        if (cap) {
            cap = isArray(cap) ? cap[ctx.valueOf() | 0] : cap;
            return <div>{cap}</div>;
        }
    });

    return <label class="switch switch-info">
        <input type="checkbox"
               checked={ctx.valueOf()}
               onchange={e => ctx.assign(e.target.checked)}/>
        <span></span>
        {caption}
    </label>;
});
