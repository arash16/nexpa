var NxDom = function () {
    import "./document";
    import "./css";
    import "./elements";
    import "./hyperscript";
    import "./components";

    this.document = document;
    this.render = renderElement;
    this.icon = Icon;
    this.el = el;
};
