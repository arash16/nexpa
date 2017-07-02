function setPropertyValue(element, property, propertyValue, rootPropertyValue, scrollData) {
    var propertyName = property;

    if (property === "scroll")
        if (scrollData.container)
            scrollData.container["scroll" + scrollData.direction] = propertyValue;

        else if (scrollData.direction === "Left")
            window.scrollTo(propertyValue, scrollData.alternateValue);
        else window.scrollTo(scrollData.alternateValue, propertyValue);

    else if (CSS.Normalizations.registered[property] && CSS.Normalizations.registered[property]("name", element) === "transform") {
        CSS.Normalizations.registered[property]("inject", element, propertyValue);
        propertyName = "transform";
        propertyValue = Data(element).transformCache[property];
    }

    else {
        if (CSS.Hooks.registered[property]) {
            var hookName = property,
                hookRoot = CSS.Hooks.getRoot(property);

            rootPropertyValue = rootPropertyValue || CSS.getPropertyValue(element, hookRoot);
            propertyValue = CSS.Hooks.injectValue(hookName, propertyValue, rootPropertyValue);
            property = hookRoot;
        }

        if (CSS.Normalizations.registered[property]) {
            propertyValue = CSS.Normalizations.registered[property]("inject", element, propertyValue);
            property = CSS.Normalizations.registered[property]("name", element);
        }

        propertyName = CSS.Names.prefixCheck(property)[0];

        if (Data(element) && Data(element).isSVG && CSS.Names.SVGAttribute(property))
            element.setAttribute(property, propertyValue);
        else element.style[propertyName] = propertyValue;
    }

    return [propertyName, propertyValue];
}
