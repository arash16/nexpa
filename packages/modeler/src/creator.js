var LAST_TYPED_VALUE_ID = 0;

function createTypedValue(meta, ctor, val) {
    var result = new ctor(val);
    result.vid = ++LAST_TYPED_VALUE_ID;

    if ("isClient") {
        var contexts = [result, meta, meta.type],
            typedView = getProp(contexts, 'view', 3, true);
        result.view = nx(() => useView(typedView, result, contexts));
    }

    // ------------------------------- Generic Write (unwrap value) -------------------------------
    if (isFunc(result.write)) {
        var origWrite = result.write;
        result.write = x => origWrite.call(result, unwrap(x));
    }


    // ----------------------------------- Generic read/assign ------------------------------------
    if (!isFunc(result.read)) {
        result.data = nx.state(meta.type.initial);
        result.read = nx(() => unwrap(result.data));
    }

    if (!isFunc(result.assign) && isNexable(result.data))
        result.assign = function (newVal) {
            var val = result.write(newVal);
            if (!isUndefined(val)) {
                if (valEqual(result.data.peek(), val, true))
                    return val;

                if (val || val === 0)
                    logger.log('written: ', val);

                result.data(val);
                return val;
            }
        };

    // ------------------------------------- Generic Validate -------------------------------------
    var validate = result.validate,
        isRequired = result.required !== false && meta.required,
        reqMessage = isString(result.required) ? result.required : meta.required;

    if (!isString(reqMessage))
        reqMessage = l("This field is Required and can't be empty.");

    result.validate = nx(function () {
        if (!isRequired && !validate) return [];

        var val = result.read();
        if (isVoid(val) || val.length === 0)
            return isRequired ? [reqMessage] : [];

        var errors = [];
        return validate && validate.call(result, val, errors) || errors;
    });


    // --------------------- Generic toString/valueOf/toJSON (--> nexables) -----------------------
    ['toString', 'valueOf', 'toJSON'].forEach(function (p) {
        if (!isNexable(result[p]) && isFunc(result[p]))
            result[p] = nx(result[p].bind(result));
    });


    // ------------------------------------- Generic obj.value ------------------------------------
    if (!hasProp(result, 'value'))
        defineProp(result, 'value', {
            enumerable: true,
            get: result.read,
            set: result.assign
        });


    // ----------------------------------------- INIT Call -----------------------------------------
    if (isFunc(result.assign)) {
        val = result.assign(val);
        if (isUndefined(val))
            result.assign(isVoid(result.initial) ? meta.initial : result.initial);
    }

    return result;
}
