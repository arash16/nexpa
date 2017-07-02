/* The singular getPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */
function getPropertyValue(element, property, rootPropertyValue, forceStyleLookup) {
    function computePropertyValue(element, property) {
        var toggleDisplay = false;

        if (property === "borderColor") property = "borderTopColor";
        if (/^(width|height)$/.test(property) && CSS.getPropertyValue(element, "display") === 0) {
            toggleDisplay = true;
            CSS.setPropertyValue(element, "display", CSS.Values.getDisplayType(element));
        }

        function revertDisplay() {
            if (toggleDisplay)
                CSS.setPropertyValue(element, "display", "none");
        }

        if (!forceStyleLookup)
            if (property === "height" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                var contentBoxHeight = element.offsetHeight
                    - (parseFloat(CSS.getPropertyValue(element, "borderTopWidth")) || 0)
                    - (parseFloat(CSS.getPropertyValue(element, "borderBottomWidth")) || 0)
                    - (parseFloat(CSS.getPropertyValue(element, "paddingTop")) || 0)
                    - (parseFloat(CSS.getPropertyValue(element, "paddingBottom")) || 0);

                revertDisplay();
                return contentBoxHeight;
            }
            else if (property === "width" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                var contentBoxWidth = element.offsetWidth
                    - (parseFloat(CSS.getPropertyValue(element, "borderLeftWidth")) || 0)
                    - (parseFloat(CSS.getPropertyValue(element, "borderRightWidth")) || 0)
                    - (parseFloat(CSS.getPropertyValue(element, "paddingLeft")) || 0)
                    - (parseFloat(CSS.getPropertyValue(element, "paddingRight")) || 0);

                revertDisplay();
                return contentBoxWidth;
            }

        var computedStyle = !Data(element)
            && Data(element).computedStyle
            || window.getComputedStyle(element, null);

        if (Data(element)) Data(element).computedStyle = computedStyle;


        var computedValue =
            IE === 9 && property === "filter" ?
            computedStyle.getPropertyValue(property) :
            computedStyle[property];

        if (computedValue === "" || computedValue === null)
            computedValue = element.style[property];

        revertDisplay();

        if (computedValue === "auto" && /^(top|right|bottom|left)$/i.test(property)) {
            var position = computePropertyValue(element, "position");
            if (position === "fixed" || (position === "absolute" && /top|left/i.test(property)))
                computedValue = $(element).position()[property] + "px";
        }

        return computedValue;
    }


    if (CSS.Hooks.registered[property]) {
        var hook = property,
            hookRoot = CSS.Hooks.getRoot(hook);

        if (rootPropertyValue === undefined)
            rootPropertyValue = CSS.getPropertyValue(element, CSS.Names.prefixCheck(hookRoot)[0]);

        if (CSS.Normalizations.registered[hookRoot])
            rootPropertyValue = CSS.Normalizations.registered[hookRoot]("extract", element, rootPropertyValue);

        var propertyValue = CSS.Hooks.extractValue(hook, rootPropertyValue);
    }

    else if (CSS.Normalizations.registered[property]) {
        var normalizedPropertyName = CSS.Normalizations.registered[property]("name", element);
        if (normalizedPropertyName !== "transform") {
            var normalizedPropertyValue = computePropertyValue(element, CSS.Names.prefixCheck(normalizedPropertyName)[0]);
            if (CSS.Values.isCSSNullValue(normalizedPropertyValue) && CSS.Hooks.templates[property])
                normalizedPropertyValue = CSS.Hooks.templates[property][1];
        }
        propertyValue = CSS.Normalizations.registered[property]("extract", element, normalizedPropertyValue);
    }


    if (!/^[\d-]/.test(propertyValue))
        if (Data(element) && Data(element).isSVG && CSS.Names.SVGAttribute(property))
            if (/^(height|width)$/i.test(property))
                try {
                    propertyValue = element.getBBox()[property];
                } catch (error) {
                    propertyValue = 0;
                }
            else propertyValue = element.getAttribute(property);
        else propertyValue = computePropertyValue(element, CSS.Names.prefixCheck(property)[0]);


    if (CSS.Values.isCSSNullValue(propertyValue)) propertyValue = 0;
    return propertyValue;
}
