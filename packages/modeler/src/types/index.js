var namedTypes = {},
    strucRefiners = [];

function _typeName() {
    return this.name || '[?]';
}

function Type(def) {
    extend(this, def);
}

Type.prototype = rawObject({
    toString: _typeName,
    valueOf: _typeName,
    toJSON: _typeName
});

function defineType(name, type) {
    if (isUndefined(type) && !isString(name)) type = name;
    if (isFunc(type)) type = { create: type };
    if (isString(name)) type.name = name;

    if (!(type instanceof Type))
        type = new Type(type);

    if (isFunc(type.refine))
        strucRefiners.push(type);

    if (isFunc(type.create) && isString(type.name))
        namedTypes[type.name] = type;
}

import "./object";
import "./boolean";
import "./number";
import "./string";
import "./select";
import "./date";
import "./list";
import "./entity";
