// Hooks allow a sub-property (e.g. "boxShadowBlur") of a compound-value CSS property
// (e.g. "boxShadow: X Y Blur Spread Color") to be animated as if it were a discrete property.

// Note: Beyond enabling fine-grained property animation, hooking is necessary since Velocity only
// tweens properties with single numeric values; unlike CSS transitions, Velocity does not interpolate compound-values.

CSS.Hooks = {
    // Templates are a concise way of indicating which sub-properties
    // must be individually registered for each compound-value CSS property.

    // Each template consists of the compound-value's base name,
    // its constituent sub-property names, and those sub-properties' default values.
    templates: {
        "textShadow": ["Color X Y Blur", "black 0px 0px 0px"],
        "boxShadow": ["Color X Y Blur Spread", "black 0px 0px 0px 0px"],
        "clip": ["Top Right Bottom Left", "0px 0px 0px 0px"],
        "backgroundPosition": ["X Y", "0% 0%"],
        "transformOrigin": ["X Y Z", "50% 50% 0px"],
        "perspectiveOrigin": ["X Y", "50% 50%"]
    },

    // A "registered" hook is one that has been converted from its template form into a live,
    // tweenable property. It contains data to associate it with its root property.
    registered: {
        // Note: A registered hook looks like this ==> textShadowBlur: [ "textShadow", 3 ],
        // which consists of the sub-property's name, the associated root property's name,
        // and the sub-property's position in the root's value.
    },

    // Convert the templates into individual hooks then append them to the registered object above.
    register: function () {
        // Color hooks registration: Colors are defaulted to white -- as opposed to black -- since colors that are
        // currently set to "transparent" default to their respective template below when color-animated,
        // and white is typically a closer match to transparent than black is. An exception is made for text ("color"),
        // which is almost always set closer to black than white.
        for (var i = 0; i < CSS.Lists.colors.length; i++) {
            var rgbComponents = CSS.Lists.colors[i] === "color" ? "0 0 0 1" : "255 255 255 1";
            CSS.Hooks.templates[CSS.Lists.colors[i]] = ["Red Green Blue Alpha", rgbComponents];
        }


        // In IE, color values inside compound-value properties are positioned
        // at the end the value instead of at the beginning.
        // Thus, we re-arrange the templates accordingly.
        if (IE) for (var rootProperty in CSS.Hooks.templates) {
            var hookTemplate = CSS.Hooks.templates[rootProperty],
                hookNames = hookTemplate[0].split(" ");

            var defaultValues = hookTemplate[1].match(CSS.RegEx.valueSplit);
            if (hookNames[0] === "Color") {
                // Reposition both the hook's name and its default value
                // to the end of their respective strings.
                hookNames.push(hookNames.shift());
                defaultValues.push(defaultValues.shift());

                // Replace the existing template for the hook's root property.
                CSS.Hooks.templates[rootProperty] = [hookNames.join(" "), defaultValues.join(" ")];
            }
        }

        // Hook registration.
        for (rootProperty in CSS.Hooks.templates) {
            hookTemplate = CSS.Hooks.templates[rootProperty];
            hookNames = hookTemplate[0].split(" ");

            for (i in hookNames) {
                var fullHookName = rootProperty + hookNames[i];

                // For each hook, register its full name (e.g. textShadowBlur)
                // with its root property (e.g. textShadow) and the hook's position
                // in its template's default value string.
                CSS.Hooks.registered[fullHookName] = [rootProperty, i];
            }
        }
    },

    /*****************************
     Injection and Extraction
     *****************************/

    // Look up the root property associated with the hook (e.g. return "textShadow" for "textShadowBlur").
    // Since a hook cannot be set directly (the browser won't recognize it), style updating for hooks
    //   is routed through the hook's root property.
    getRoot: function (property) {
        var hookData = CSS.Hooks.registered[property];

        // If there was no hook match, return the property name untouched.
        return hookData ? hookData[0] : property;
    },

    // Convert any rootPropertyValue, null or otherwise, into a space-delimited list of hook values so that
    // the targeted hook can be injected or extracted at its standard position.
    cleanRootPropertyValue: function (rootProperty, rootPropertyValue) {
        // If the rootPropertyValue is wrapped with "rgb()", "clip()", etc.,
        // remove the wrapping to normalize the value before manipulation.
        if (CSS.RegEx.valueUnwrap.test(rootPropertyValue))
            rootPropertyValue = rootPropertyValue.match(CSS.RegEx.valueUnwrap)[1];


        // If rootPropertyValue is a CSS null-value (from which there's inherently no hook value to extract),
        // default to the root's default value as defined in CSS.Hooks.templates.

        // Note: CSS null-values include "none", "auto", and "transparent". They must be converted into their
        // zero-values (e.g. textShadow: "none" ==> textShadow: "0px 0px 0px black") for hook manipulation to proceed.
        if (CSS.Values.isCSSNullValue(rootPropertyValue))
            rootPropertyValue = CSS.Hooks.templates[rootProperty][1];

        return rootPropertyValue;
    },

    // Extracted the hook's value from its root property's value.
    // This is used to get the starting value of an animating hook. */
    extractValue: function (fullHookName, rootPropertyValue) {
        var hookData = CSS.Hooks.registered[fullHookName];
        if (hookData) {
            var hookRoot = hookData[0],
                hookPosition = hookData[1];

            rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);

            // Split rootPropertyValue into its constituent hook values
            // then grab the desired hook at its standard position.
            return rootPropertyValue.toString().match(CSS.RegEx.valueSplit)[hookPosition];
        }

        // If the provided fullHookName isn't a registered hook,
        // return the rootPropertyValue that was passed in. */
        return rootPropertyValue;
    },

    // Inject the hook's value into its root property's value. This is used to piece back together the root property
    // once Velocity has updated one of its individually hooked values through tweening.
    injectValue: function (fullHookName, hookValue, rootPropertyValue) {
        var hookData = CSS.Hooks.registered[fullHookName];
        if (hookData) {
            rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookData[0], rootPropertyValue);

            // Split rootPropertyValue into its individual hook values, replace the targeted value with hookValue,
            // then reconstruct the rootPropertyValue string.
            var rootPropertyValueParts = rootPropertyValue
                .toString().match(CSS.RegEx.valueSplit);

            rootPropertyValueParts[hookData[1]] = hookValue;
            return rootPropertyValueParts.join(" ");
        }

        // If the provided fullHookName isn't a registered hook,
        // return the rootPropertyValue that was passed in.
        return rootPropertyValue;
    }
}
