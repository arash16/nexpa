el.defineComponent('form-group', function (props, childs) {
    var inputElem = nx.unwrap(props.icon, function (ico) {
        return ico ? <div class="input-group">
            {childs}
            <span class="input-group-addon"><Icon id={ico}/></span>
        </div> : childs;
    });

    var reqStar = nx.unwrap(props.required, function (r) {
        return r && <span class="text-danger">*</span>;
    });

    var idName = !isNexable(props.id) ? props.id || props.name :
                 nx.unwrap(props.id, props.name, (id, name) => id || name);

    return <div class={['form-group', props.className]}>
        <label class="col-md-3 control-label" for={idName}>{props.label} {reqStar}</label>
        <div class="col-md-9">{inputElem}</div>
    </div>;
});
