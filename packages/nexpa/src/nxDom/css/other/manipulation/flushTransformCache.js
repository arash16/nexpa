function flushTransformCache(element) {
    var transformString = "",
        perspective;

    eachKey(Data(element).transformCache, function (transformName) {
        var transformValue = Data(element).transformCache[transformName];
        if (transformName === "transformPerspective") {
            perspective = transformValue;
            return true;
        }

        if (IE === 9 && transformName === "rotateZ")
            transformName = "rotate";

        transformString += transformName + transformValue + " ";
    });

    if (perspective)
        transformString = "perspective" + perspective + " " + transformString;

    setPropertyValue(element, "transform", transformString);
}
