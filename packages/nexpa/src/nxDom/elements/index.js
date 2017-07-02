import "./patcher";
import "./nxElement";
import "./nxTextNode";

var renderElement = function (nxElement) {
    nxElement = unwrap(nxElement);

    if (nxElement && isFunc(nxElement.render))
        return nxElement.render();

    throw new TypeError('Invalid child.');
};
