var NxDom = function () {
	import "nxutils";
	import "nexable";

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
