spa.router = (function () {
    import "./utils";
    import "./router";
    import "./route-item";
    import "./route-info";
    import "./route-fragment";

    return function (items, activeHash) {
        return new Router(items, activeHash || spa.window.activeHash);
    };
})();
