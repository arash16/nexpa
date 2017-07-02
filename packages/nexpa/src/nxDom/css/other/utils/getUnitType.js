var __reUnitLessCssProperties = /(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i;

function getUnitType(property) {
    return /^(rotate|skew)/i.test(property) ? 'deg' :
           __reUnitLessCssProperties.test(property) ? '' : 'px';
}
