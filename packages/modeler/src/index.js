var Modeler = function (setting) {
    var el = setting.el,
        Icon = setting.icon;

    function modeler(s, v) {
        var m = modeler.refine(s);
        return arguments.length == 1 ? m : m.create(v);
    }

    modeler.create = function (s, v) {
        return modeler(s, v);
    };

    import "./utils";
    import "./refiner";
    import "./creator";
    import "./types";

    var useView = (function () {
        import "views";
        return useView;
    })();

    return modeler;
};
