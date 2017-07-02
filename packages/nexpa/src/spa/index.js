var SPA = function () {
    var spa = this,
        nxDom = new NxDom(),
        document = nxDom.document,
        Icon = nxDom.icon,
        el = nxDom.el;

    import "utils";
    import "window";
    import "init";

    extend(spa, {
        document: document,
        window: nxWindow,
        nxDom: nxDom,
        init: init,
        icon: Icon,
        el: el
    });

    import "plugins";
};
