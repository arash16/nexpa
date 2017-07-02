el.defineComponent('page', function (props, childs) {
    import "header";
    import "breadcrumb";

    var router = props.router;

    return <div id="page-content-wrapper">
        {nxPageHeader(props)}
        {nxBreadcrumb(props)}
        {childs}
    </div>;
});
