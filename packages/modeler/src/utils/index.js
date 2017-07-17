function getProp(contexts, props, lastInd, noUnwrap) {
    var len = (isNumber(lastInd) ? min(lastInd, contexts.length) : contexts.length) | 0;
    for (var i = 0; i < len; i++) {
        var ctx = contexts[i];
        if (ctx) {
            for (var j = 0, prop = props; isArray(props) ? (prop = props[j]) : !j; j++) {
                var result = ctx[prop];
                if (result && !noUnwrap) result = unwrap(result);
                if (!isVoid(result) && result !== false) // 0 '' false
                    return result;
            }
        }
    }
}

var FUNCTION_PARSE_ERROR = l('Runtime error occurred! Please consult console.');

function createFunction(params, body) {
    var bodyExpr = body,
        paramsStr = params;

    if (isUndefined(bodyExpr)) {
        bodyExpr = params;
        paramsStr = '';
    }

    if (isArray(paramsStr))
        paramsStr = paramsStr.join(', ');

    try {
        var fn = new Function(paramsStr, bodyExpr);
    } catch (e) {
        var lines = ['ERROR on parsing' + (e.name ? ' (' + e.name + '): ' : ': ') + e.message,
                     'Definition: (' + paramsStr + ') => ' + bodyExpr];

        logger.error(lines[0], e);
        logger.warn(lines[1]);
        spa.alert.error(FUNCTION_PARSE_ERROR);

        throw new Error(lines.join('\n\n'), e);
    }

    return function () {
        try {
            return fn.apply(this, arguments);
        }
        catch (e) {
            var lines = ['ERROR on evaluation' + (e.name ? ' (' + e.name + '): ' : ': ') + e.message,
                         'Definition: (' + paramsStr + ') => ' + bodyExpr,
                         'Arguments: ' + JSON.stringify(slice(arguments)),
                         'Context: ' + this];

            logger.error(lines[0], e);
            logger.warn(lines[1]);
            logger.warn(lines[2], arguments);
            logger.warn(lines[3], this);

            spa.alert.error(FUNCTION_PARSE_ERROR);
            throw new Error(lines.join('\n\n'));
        }
    }
}

function createFunctor(expr) {
    if (isFunc(expr)) fn = expr;
    else {
        var fnStr = !isArray(expr) ? expr
            : unique(expr).map(e => '(' + e + ')').join(' && ');

        if (!fnStr || !fnStr.length) return constFunc(true);
        var fn = createFunction('$data, $context, $parent, $parentContext', 'return (' + fnStr + ');');
    }

    return function ($context) {
        var $parentContext = $context.parent || {},
            $parent = $parentContext.read || identity,
            $data = $context.read();

        return fn.call($data, $data, $context, $parent() || {}, $parentContext);
    };
}
