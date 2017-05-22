function HashObject() {
}


HashObject.prototype = rawObject({
    isEqualTo: function (other, update) {
        if (other instanceof HashObject) {
            var obj = this;
            for (var p in obj)
                if (!(p in other) || !valEqual(obj[p], other[p], update))
                    return false;

            return true;
        }
    }
});


function deepConvert(obj) {
    var ID_FIELD = '__h',
        lastId = 0,
        fin = [];

    var cls = nullObject(),
        res = _deepClone(obj);

    fin.forEach(function (o) { delete o[ID_FIELD]; });

    return res;

    function _deepConvert(obj) {
        if (isObject(obj)) {
            if (obj instanceof HashObject) return obj;
            if (!isArray(obj)) {
                var proto = Object.getPrototypeOf(obj);
                if (proto && proto !== Object.prototype) return obj;
            }


            var id = obj[ID_FIELD];
            if (id && cls[id].in === obj)
                return cls[id].out;

            id = obj[ID_FIELD] = ++lastId;
            cls[id] = { in: obj };
            fin.push(obj);

            if (isArray(obj)) {
                var res = cls[id].out = [];
                for (var i = 0; i < obj.length; i++)
                    res[i] = _deepConvert(obj[i]);
                return res;
            }


            res = cls[id].out = new HashObject();

            var props = [],
                states = nullObject();

            for (var p in obj)
                if (p[0] !== '_' && p[0] !== '$') {
                    props.push(p);
                    states[p] = nx.state(_deepConvert(obj[p]));
                    Object.defineProperty(res, p, {
                        get: function () {

                        },
                        set: function () {

                        }
                    });
                }
            res._props = props;

            return res;
        }

        return obj;
    }
}
