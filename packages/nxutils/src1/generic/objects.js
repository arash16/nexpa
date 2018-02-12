import "./base";

var __oPropertyDescriptor = Object.getOwnPropertyDescriptor,
    setProto = Object.setPrototypeOf || ((obj, p) => ((obj.__proto__ = p), obj));

function rawObject() {
    var res = nullObject(),
        len = arguments.length;

    for (var i = 0; i < len; i++)
        rawExtend(res, arguments[i]);

    return res;
}

function rawExtend(target, desc, writable, enumerable) {
    var isWritable = isUndefined(writable) || !!writable;
    eachKey(desc, function (p, val) {
        defineProp(target, p, {
            value: val,
            writable: isWritable,
            enumerable: enumerable || false
        });
    });
    return target;
}

function mixin() {
    var target = isObjectLike(arguments[0]) ? arguments[0] : {};
    for (var i = 1, len = arguments.length; i < len; i++) {
        var source = arguments[i];
        if (!isVoid(source)) {
            var props = getObjectOwnKeys(source);
            for (var j = 0, k; k = props[j]; j++)
                defineProp(target, k, __oPropertyDescriptor(source, k) || { value: source[k] });
        }
    }
    return target;
}

function defaults(target) {
    var aLen = arguments.length,
        result = isObjectLike(target);

    for (var i = 1; i < aLen; i++)
        eachKey(arguments[i], function (p, val) {
            result = result || {};
            if (isUndefined(result[p]))
                result[p] = val;
        });
    return result;
}

function deepClone(obj) {
    var ID_FIELD = '__^*',
        lastId = 0,
        fin = [];

    var cls = {},
        res = _deepClone(obj);

    fin.forEach(function (o) { delete o[ID_FIELD]; });

    return res;

    function _deepClone(obj) {
        if (isObject(obj)) {
            if (!isArray(obj)) {
                if (obj instanceof Object || isPromiseLike(obj) || isFunc(obj.constructor))
                    return obj;
            }


            var id = obj[ID_FIELD];
            if (id && cls[id] && cls[id].in === obj) {
                if (cls[id].out) return cls[id].out;

                // circular reference from prototype property to object
                return cls[id].out = {};
            }

            id = obj[ID_FIELD] = ++lastId;
            cls[id] = { in: obj };
            fin.push(obj);

            if (isArray(obj)) {
                var res = cls[id].out = [];

                for (i = 0; i < obj.length; i++)
                    res[i] = _deepClone(obj[i]);

                return res;
            }

            // Object.keys -> enumerable
            // Object.getOwnPropertyNames -> non-enumerable

            var props = Object.getOwnPropertyNames(obj),
                proto = _deepClone(Object.getPrototypeOf(obj));

            if (cls[id].out) Object.setPrototypeOf(res = cls[id].out, proto);
            else res = cls[id].out = Object.create(proto);

            for (var i = 0, p; p = props[i]; i++)
                if (p !== ID_FIELD)
                    res[p] = _deepClone(obj[p]);

            return res;
        }

        return obj;
    }
}
