var CSSProperties = (function () {
    var standards = ["binding", "borderBottomColors", "borderLeftColors", "borderRightColors", "borderTopColors", "columnFill", "floatEdge", "forceBrokenImageIcon", "hyphens", "imageRegion", "orient", "outlineRadius", "outlineRadiusBottomleft", "outlineRadiusBottomright", "outlineRadiusTopleft", "outlineRadiusTopright", "stackSizing", "textAlignLast", "textSizeAdjust", "userFocus", "userInput", "windowDragging", "windowShadow", "alignContent", "alignItems", "alignSelf", "alignmentBaseline", "all", "animation", "animationDelay", "animationDirection", "animationDuration", "animationFillMode", "animationIterationCount", "animationName", "animationPlayState", "animationTimingFunction", "backfaceVisibility", "background", "backgroundAttachment", "backgroundBlendMode", "backgroundColor", "backgroundImage", "backgroundPosition", "backgroundPositionX", "backgroundPositionY", "backgroundRepeat", "backgroundRepeatX", "backgroundRepeatY", "backgroundSize", "baselineShift", "border", "borderBottom", "borderBottomColor", "borderBottomLeftRadius", "borderBottomRightRadius", "borderBottomStyle", "borderBottomWidth", "borderCollapse", "borderColor", "borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth", "borderLeft", "borderLeftColor", "borderLeftStyle", "borderLeftWidth", "borderRadius", "borderRight", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderSpacing", "borderStyle", "borderTop", "borderTopColor", "borderTopLeftRadius", "borderTopRightRadius", "borderTopStyle", "borderTopWidth", "borderWidth", "bottom", "boxShadow", "boxSizing", "bufferedRendering", "captionSide", "clear", "clip", "clipRule", "color", "colorInterpolation", "colorInterpolationFilters", "colorRendering", "content", "counterIncrement", "counterReset", "cssFloat", "cursor", "cx", "cy", "direction", "display", "dominantBaseline", "emptyCells", "enableBackground", "fill", "fillOpacity", "fillRule", "flex", "flexBasis", "flexDirection", "flexFlow", "flexGrow", "flexShrink", "flexWrap", "float", "floodColor", "floodOpacity", "font", "fontFamily", "fontKerning", "fontLanguageOverride", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontSynthesis", "fontVariant", "fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition", "fontWeight", "glyphOrientationHorizontal", "glyphOrientationVertical", "height", "imageOrientation", "imageRendering", "imeMode", "isolation", "justifyContent", "left", "letterSpacing", "lightingColor", "lineHeight", "listStyle", "listStyleImage", "listStylePosition", "listStyleType", "margin", "marginBottom", "marginLeft", "marginRight", "marginTop", "marker", "markerEnd", "markerMid", "markerOffset", "markerStart", "marks", "maskType", "maxHeight", "maxWidth", "maxZoom", "minHeight", "minWidth", "minZoom", "mixBlendMode", "objectFit", "objectPosition", "opacity", "order", "orientation", "orphans", "outline", "outlineColor", "outlineOffset", "outlineStyle", "outlineWidth", "overflow", "overflowWrap", "overflowX", "overflowY", "padding", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "page", "pageBreakAfter", "pageBreakBefore", "pageBreakInside", "paintOrder", "perspective", "perspectiveOrigin", "pointerEvents", "position", "quotes", "r", "resize", "right", "rubyAlign", "rx", "ry", "scrollBehavior", "scrollSnapCoordinate", "scrollSnapDestination", "scrollSnapPointsX", "scrollSnapPointsY", "scrollSnapType", "scrollSnapTypeX", "scrollSnapTypeY", "shapeImageThreshold", "shapeMargin", "shapeOutside", "shapeRendering", "size", "speak", "src", "stopColor", "stopOpacity", "stroke", "strokeDasharray", "strokeDashoffset", "strokeLinecap", "strokeLinejoin", "strokeMiterlimit", "strokeOpacity", "strokeWidth", "tabSize", "tableLayout", "textAlign", "textAnchor", "textDecoration", "textDecorationColor", "textDecorationLine", "textDecorationStyle", "textIndent", "textOverflow", "textRendering", "textShadow", "textTransform", "top", "touchAction", "transform", "transformOrigin", "transformStyle", "transition", "transitionDelay", "transitionDuration", "transitionProperty", "transitionTimingFunction", "unicodeBidi", "unicodeRange", "userZoom", "vectorEffect", "verticalAlign", "visibility", "appRegion", "appearance", "backgroundClip", "backgroundComposite", "backgroundOrigin", "borderAfter", "borderAfterColor", "borderAfterStyle", "borderAfterWidth", "borderBefore", "borderBeforeColor", "borderBeforeStyle", "borderBeforeWidth", "borderEnd", "borderEndColor", "borderEndStyle", "borderEndWidth", "borderHorizontalSpacing", "borderImage", "borderStart", "borderStartColor", "borderStartStyle", "borderStartWidth", "borderVerticalSpacing", "boxAlign", "boxDecorationBreak", "boxDirection", "boxFlex", "boxFlexGroup", "boxLines", "boxOrdinalGroup", "boxOrient", "boxPack", "boxReflect", "clipPath", "columnBreakAfter", "columnBreakBefore", "columnBreakInside", "columnCount", "columnGap", "columnRule", "columnRuleColor", "columnRuleStyle", "columnRuleWidth", "columnSpan", "columnWidth", "columns", "filter", "fontFeatureSettings", "fontSizeDelta", "fontSmoothing", "highlight", "hyphenateCharacter", "lineBoxContain", "lineBreak", "lineClamp", "locale", "logicalHeight", "logicalWidth", "marginAfter", "marginAfterCollapse", "marginBefore", "marginBeforeCollapse", "marginBottomCollapse", "marginCollapse", "marginEnd", "marginStart", "marginTopCollapse", "mask", "maskBoxImage", "maskBoxImageOutset", "maskBoxImageRepeat", "maskBoxImageSlice", "maskBoxImageSource", "maskBoxImageWidth", "maskClip", "maskComposite", "maskImage", "maskOrigin", "maskPosition", "maskPositionX", "maskPositionY", "maskRepeat", "maskRepeatX", "maskRepeatY", "maskSize", "maxLogicalHeight", "maxLogicalWidth", "minLogicalHeight", "minLogicalWidth", "paddingAfter", "paddingBefore", "paddingEnd", "paddingStart", "perspectiveOriginX", "perspectiveOriginY", "printColorAdjust", "rtlOrdering", "rubyPosition", "tapHighlightColor", "textCombine", "textDecorationsInEffect", "textEmphasis", "textEmphasisColor", "textEmphasisPosition", "textEmphasisStyle", "textFillColor", "textOrientation", "textSecurity", "textStroke", "textStrokeColor", "textStrokeWidth", "transformOriginX", "transformOriginY", "transformOriginZ", "userDrag", "userModify", "userSelect", "whiteSpace", "widows", "width", "willChange", "wordBreak", "wordSpacing", "wordWrap", "writingMode", "x", "y", "zIndex", "zoom"];
    var vendors = ['webkit', 'moz', 'o', 'ms', 'MS'];

    var standardStyleProperty = nullObject();
    standards.forEach(function (p) {
        var k = p.replace(/[A-Z]/g, function (x) { return '-' + x.toLowerCase(); });
        standardStyleProperty[p] = standardStyleProperty[k] = k;
        standardStyleProperty[p.toLowerCase()] = k;

        var pu = p[0].toUpperCase() + p.substr(1);
        for (var i = 0, v; v = vendors[i]; i++) {
            standardStyleProperty[v + pu] = k;
            standardStyleProperty[v[0].toUpperCase() + v.substr(1) + pu] = k;
            standardStyleProperty[(v + pu).toLowerCase()] = k;
            standardStyleProperty['-' + v.toLowerCase() + '-' + k] = k;
        }
    });

    function CSSProperties() {
        defineProp(this, {
            keys: { value: [] },
            values: { value: nullObject() }
        });
    }

    CSSProperties.prototype = rawObject({
        getPropertyValue: function (key) {
            key = standardStyleProperty[key] || standardStyleProperty[key.toLowerCase];
            if (key) {
                var val = this.values[key];
                if (!val && val !== 0) return "";
                return val;
            }
        },
        setProperty: function (key, value) {
            key = standardStyleProperty[key] || standardStyleProperty[key.toLowerCase];
            if (key) {
                if (value === "" || value === undefined)
                    return this.removeProperty(prop);

                if (!hasProp(this.values, key)) this.keys.push(key);
                this.values[key] = value;
            }
        },
        removeProperty: function (key) {
            key = standardStyleProperty[key] || standardStyleProperty[key.toLowerCase];
            if (key && hasProp(this.values, key)) {
                var val = this.values[key];
                delete this.values[key];
                this.keys.splice(this.keys.indexOf(key), 1);
                return val;
            }
        },
        toString: toString,
        valueOf: toString
    });

    function toString() {
        var values = this.values;
        return this.keys
            .filter(function (key) { return values[key]; })
            .map(function (key) { return key + ':' + values[key]; })
            .join(';');
    }

    eachKey(standardStyleProperty, function (prop) {
        defineProp(CSSProperties.prototype, prop, {
            set: function (val) {
                this.setProperty(prop, val);
            },
            get: function () {
                return this.getPropertyValue(prop);
            }
        });
    });

    return CSSProperties;
})();
