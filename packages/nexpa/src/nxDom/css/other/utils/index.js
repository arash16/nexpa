import 'isIE';

CSS.RegEx = {
    isHex: /^#([A-f\d]{3}){1,2}$/i,

    // Unwrap a property value's surrounding text,
    // e.g. "rgba(4, 3, 2, 1)" ==> "4, 3, 2, 1" and "rect(4px 3px 2px 1px)" ==> "4px 3px 2px 1px"
    valueUnwrap: /^[A-z]+\((.*)\)$/i,

    wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,

    // Split a multi-value property into an array of sub-values,
    // e.g. "rgba(4, 3, 2, 1) 4px 3px 2px 1px" ==> [ "rgba(4, 3, 2, 1)", "4px", "3px", "2px", "1px" ]
    valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/ig
}

CSS.Lists = {
    colors: 'fill stroke stopColor color backgroundColor borderColor borderTopColor borderRightColor borderBottomColor borderLeftColor outlineColor'.split(' '),
    transformsBase: 'translateX translateY scale scaleX scaleY skewX skewY rotateZ'.split(' '),
    transforms3D: 'transformPerspective translateZ scaleZ rotateX rotateY'.split(' ')
};


var __reCssNullVals = /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i;

function isCSSNullValue(value) {
    // The browser defaults CSS values that have not been set to either 0 or one of several possible null-value strings.
    // Thus, we check for both falseness and these special strings.

    // Null-value checking is performed to default the special strings to 0 (for the sake of tweening) or their hook
    // templates as defined as CSS.Hooks (for the sake of hook injection/extraction).

    // Note: Chrome returns "rgba(0, 0, 0, 0)" for an undefined color whereas IE returns "transparent".
    return (value == 0 || __reCssNullVals.test(value));
}


// --------------------------------------------------------------------------------------------------------------------------------


CSS.Names = {
    // Camelcase a property name into its JavaScript notation (e.g. "background-color" ==> "backgroundColor").
    // CamelCasing is used to normalize property names between and across calls.
    camelCase: function (property) {
        return property.replace(/-(\w)/g, function (match, subMatch) {
            return subMatch.toUpperCase();
        });
    },

    // For SVG elements, some properties (namely, dimensional ones) are GET/SET
    // via the element's HTML attributes (instead of via CSS styles)
    SVGAttribute: function (property) {
        var SVGAttributes = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";

        // Certain browsers require an SVG transform to be applied as an attribute.
        // (Otherwise, application via CSS is preferable due to 3D support.)
        if (IE || (Velocity.State.isAndroid && !Velocity.State.isChrome))
            SVGAttributes += "|transform";

        return new RegExp("^(" + SVGAttributes + ")$", "i").test(property);
    },

    // Determine whether a property should be set with a vendor prefix.
    // If a prefixed version of the property exists, return it. Otherwise, return the original property name.
    // If the property is not at all supported by the browser, return a false flag.
    prefixCheck: function (property) {
        /* If this property has already been checked, return the cached value. */
        if (Velocity.State.prefixMatches[property])
            return [Velocity.State.prefixMatches[property], true];

        else {
            var vendors = ["", "Webkit", "Moz", "ms", "O"];
            for (var i = 0, vendorsLength = vendors.length; i < vendorsLength; i++) {
                var propertyPrefixed;

                if (i === 0) propertyPrefixed = property;
                else {
                    // Capitalize the first letter of the property
                    // to conform to JavaScript vendor prefix notation (e.g. webkitFilter).
                    propertyPrefixed = vendors[i] + property.replace(/^\w/, function (match) { return match.toUpperCase(); });
                }

                // Check if the browser supports this property as prefixed.
                if (Type.isString(Velocity.State.prefixElement.style[propertyPrefixed])) {
                    // Cache the match.
                    Velocity.State.prefixMatches[property] = propertyPrefixed;
                    return [propertyPrefixed, true];
                }
            }

            // If the browser doesn't support this property in any form,
            // include a false flag so that the caller can decide how to proceed.
            return [property, false];
        }
    }
}


CSS.Values = {
    // The class add/remove functions are used to
    // temporarily apply a "velocity-animating" class to elements while they're animating.
    addClass: function (element, className) {
        if (element.classList)
            element.classList.add(className);
        else element.className += (element.className.length ? " " : "") + className;
    },

    removeClass: function (element, className) {
        if (element.classList)
            element.classList.remove(className);
        else element.className = element.className.toString()
            .replace(new RegExp("(^|\\s)" + className.split(" ").join("|") + "(\\s|$)", "gi"), " ");
    }
}
