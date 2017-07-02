/* IE detection. Gist: https://gist.github.com/julianshapiro/9098609 */
var IE = (function () {
    if (document.documentMode)
        return document.documentMode;

    else for (var i = 7; i > 4; i--) {
        var div = document.createElement("div");
        div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";

        if (div.getElementsByTagName("span").length) return i;
    }

    return undefined;
})();
