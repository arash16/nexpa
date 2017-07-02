var nxBreadcrumb = function (props) {
    return <ul class="breadcrumb breadcrumb-top">
        <li>Home</li>
        <li>
            <a href={ router.activeHash() }>{props.title}</a>
        </li>
    </ul>;
};
