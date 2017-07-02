var nxPageHeader = function (props) {
    var hasHeader = (props.prefix || props.title || props.desc || props.widgets) || undefined;
    if (hasHeader) {
        var header = <h1>
            {props.prefix}
            <strong>{props.title}</strong>
            {props.desc && <small><br/>{props.desc}</small>}
        </h1>;

        var widgets = toArray(props.widgets);
        if (widgets.length) {
            widgets = widgets.length === 1 ? widgets[0] :
                <div class="row text-center">{widgets}</div>;

            header = <div class="row">
                <div class="col-md-4 col-lg-6 hidden-xs hidden-sm">{header}</div>
                <div class="col-md-8 col-lg-6">{widgets}</div>
            </div>;
        }
    }

    return <div class={{'content-header': 1, 'content-header-media': props.image }}>
        {hasHeader && <div class="header-section">{header}</div> }
        {props.image && <img src={props.image} class="animation-pulseSlow"/>}
    </div>;
};
