var globalElements = nx.state([]);

(function () {
    spa.registerGlobalElement = registerGlobalElement;

    function registerGlobalElement(elem) {
        globalElements(globalElements.peek().concat(elem));
    }

    import "router";
    import "alerts";
    import "modals";
    import "popups";
    import "tooltips";
})();
