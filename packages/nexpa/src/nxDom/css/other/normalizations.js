// Normalizations standardize CSS property manipulation by
// polly-filling browser-specific implementations (e.g. opacity)
// and reformatting special properties (e.g. clip, rgba) to look like standard ones.
CSS.Normalizations = {
    registered: {
        clip: function (type, element, propertyValue) {
            switch (type) {
                case "name":
                    return "clip";

                case "extract":
                    if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue))
                        return propertyValue;
                    else {
                        var extracted = propertyValue.toString().match(CSS.RegEx.valueUnwrap);
                        return extracted ? extracted[1].replace(/,(\s+)?/g, " ") : propertyValue;
                    }

                case "inject":
                    return "rect(" + propertyValue + ")";
            }
        },

        blur: function (type, element, propertyValue) {
            switch (type) {
                case "name":
                    return Velocity.State.isFirefox ? "filter" : "-webkit-filter";

                case "extract":
                    var extracted = parseFloat(propertyValue);

                    // If extracted is NaN, meaning the value isn't already extracted.
                    if (isNaN(extracted)) {
                        var blurComponent = propertyValue.toString().match(/blur\(([0-9]+[A-z]+)\)/i);
                        return blurComponent ? blurComponent[1] : 0;
                    }

                    return extracted;

                case "inject":
                    /* Blur needs to be re-wrapped during injection. */
                    /* For the blur effect to be fully de-applied, it needs to be set to "none" instead of 0. */
                    return parseFloat(propertyValue) ? "blur(" + propertyValue + ")" : "none";
            }
        },

        opacity: function (type, element, propertyValue) {
            switch (type) {
                case "name":
                    return "opacity";
                case "extract":
                    return propertyValue;
                case "inject":
                    return propertyValue;
            }
        }
    },

    register: function () {
        if (!(IE <= 9) && !Velocity.State.isGingerbread)
            CSS.Lists.transformsBase = CSS.Lists.transformsBase.concat(CSS.Lists.transforms3D);

        for (var i = 0; i < CSS.Lists.transformsBase.length; i++)
            (function (transformName) {
                CSS.Normalizations.registered[transformName] = function (type, element, propertyValue) {
                    switch (type) {
                        case "name":
                            return "transform";

                        case "extract":
                            if (isUndefined((Data(element)) || isUndefined(Data(element).transformCache[transformName])))
                                return /^scale/i.test(transformName) ? 1 : 0;
                            else return Data(element).transformCache[transformName].replace(/[()]/g, "");

                        case "inject":
                            var invalid = false;

                            switch (transformName.substr(0, transformName.length - 1)) {
                                case "translate":
                                    invalid = !/(%|px|em|rem|vw|vh|\d)$/i.test(propertyValue);
                                    break;

                                case "scal":
                                case "scale":
                                    /* Chrome on Android has a bug in which scaled elements blur if their initial scale
                                     value is below 1 (which can happen with force-feeding). Thus, we detect a yet-unset scale property
                                     and ensure that its first value is always 1. More info: http://stackoverflow.com/questions/10417890/css3-animations-with-transform-causes-blurred-elements-on-webkit/10417962#10417962 */
                                    if (propertyValue < 1 && Velocity.State.isAndroid &&
                                        isUndefined(Data(element).transformCache[transformName]))
                                        propertyValue = 1;

                                    invalid = !/(\d)$/i.test(propertyValue);
                                    break;

                                case "skew":
                                    invalid = !/(deg|\d)$/i.test(propertyValue);
                                    break;

                                case "rotate":
                                    invalid = !/(deg|\d)$/i.test(propertyValue);
                                    break;
                            }

                            if (!invalid)
                                Data(element).transformCache[transformName] = "(" + propertyValue + ")";
                            return Data(element).transformCache[transformName];
                    }
                };
            })(CSS.Lists.transformsBase[i]);


        // Since Velocity only animates a single numeric value per property,
        // color animation is achieved by hooking the individual RGBA components of CSS color properties.
        // Accordingly, color values must be normalized (e.g. "#ff0000", "red", and "rgb(255, 0, 0)" ==> "255 0 0 1")
        // so that their components can be injected/extracted by CSS.Hooks logic.
        for (i = 0; i < CSS.Lists.colors.length; i++)
            (function (colorName) {
                CSS.Normalizations.registered[colorName] = function (type, element, propertyValue) {
                    switch (type) {
                        case "name":
                            return colorName;

                        case "extract":
                            // If the color is already in its hookable form (e.g. "255 255 255 1")
                            // due to having been previously extracted, skip extraction.
                            if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue))
                                extracted = propertyValue;

                            else {
                                var converted,
                                    colorNames = {
                                        black: "rgb(0, 0, 0)",
                                        blue: "rgb(0, 0, 255)",
                                        gray: "rgb(128, 128, 128)",
                                        green: "rgb(0, 128, 0)",
                                        red: "rgb(255, 0, 0)",
                                        white: "rgb(255, 255, 255)"
                                    };

                                if (/^[A-z]+$/i.test(propertyValue))
                                    converted = !isUndefined(colorNames[propertyValue]) ?
                                                colorNames[propertyValue] : colorNames.black;

                                else if (CSS.RegEx.isHex.test(propertyValue))
                                    converted = "rgb(" + CSS.Values.hexToRgb(propertyValue).join(" ") + ")";

                                else if (!/^rgba?\(/i.test(propertyValue))
                                    converted = colorNames.black;

                                // Remove the surrounding "rgb/rgba()" string then replace commas with spaces and strip
                                // repeated spaces (in case the value included spaces to begin with).
                                var extracted = (converted || propertyValue).toString()
                                    .match(CSS.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ");
                            }

                            // add a fourth (alpha) component if it's missing and default it to 1 (visible).
                            if (extracted.split(" ").length == 3)
                                extracted += " 1";

                            return extracted;


                        case "inject":
                            if (propertyValue.split(" ").length == 3) propertyValue += " 1";
                            return "rgba(" + propertyValue.replace(/\s+/g, ",")
                                    .replace(/\.(\d)+(?=,)/g, "") + ")";
                    }
                };
            })(CSS.Lists.colors[i]);
    }
}
