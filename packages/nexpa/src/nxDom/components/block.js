var persistentMaximizers = {};

el.defineComponent('block', function (props, childs) {
    var orients = ['pull-right'],
        titleOrient = 'pull-' + (props.ltr ? "right" : "left"),
        optionsOrient = 'block-options pull-' + (props.ltr ? "left" : "right"),
        blockClasses = "block";

    var optionsArr = toArray(props.options);
    if (props.maximizer) {
        var nxFull = String(props.maximizer) == 'true' ? nx(false) :
                     (persistentMaximizers[props.maximizer] = persistentMaximizers[props.maximizer] || nx(false)),
            maximizeBtn = <a class="btn btn-info btn-alt"
                             title={nxFull() ? "Unmaximize" : "Maximize"}
                             onclick={() => nxFull(!nxFull.peek())}>
                <Icon id={ nxFull() ? 'columns' : 'desktop' }/>
            </a>;

        blockClasses = {
            "animation-fadeNavigate": nx(() => !nxFull()),
            "block-fullscreen": nxFull,
            "block": 1
        };

        optionsArr = optionsArr.concat(maximizeBtn);
    }


    var subHeader = props.subHeader ? <h4 class="sub-header">{props.subHeader}</h4> : undefined,
        options = optionsArr.length ? <div class={optionsOrient}>{optionsArr}</div> : undefined,
        title = props.title ? <div class="clearfix">
            <h2 class={titleOrient}><strong>{(unwrap(props.title) || '').toString()}</strong></h2>
        </div> : undefined;

    return <div class={blockClasses}>
        <div class="block-title">{options} {title}</div>
        {subHeader} {childs}
    </div>;
});
