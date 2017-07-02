function RouteInfo(routeStr) {
    routeStr = unwrap(routeStr);

    if (routeStr instanceof RouteInfo)
        return routeStr;

    if (routeStr instanceof RouteFragment)
        return routeStr.routeInfo;

    if (isArray(routeStr)) routeStr = routeStr.map(function (x) {
        x = unwrap(x);
        if (x instanceof RouteFragment) x = x.routeInfo;
        if (x instanceof RouteInfo) return x.route.replace(reCleanRoute, '');
        if (isString(x)) {
            x = x.replace(reCleanRoute, '');
            var p = reRoutePart.exec(x);
            return p ? (p[1] || ':') + p[2] : x;
        }
    }).filter(identity).join('/');

    this.route = String(routeStr || '').replace(routeStripper, '');
    this.params = this.route.match(allParamNames) || [];
    this.regexp = routeStrToRegExp(this.route);
}


RouteInfo.prototype = rawObject({
    create: function (fragment) {
        var result = new RouteFragment(this, arguments.length ? fragment : this.route);
        if (result && result.params) return result;
    },

    // [out || this] with [params] binded
    binder: function (params) {
        var routeInfo = new RouteInfo(params),
            outRoute = isArray(params) ? this : routeInfo,
            bindParams = outRoute === this ? routeInfo.params : this.params,
            baseFrag = params instanceof RouteFragment ?
                       outRoute.unbinder(this)(params).fragment : outRoute.route,

            lastInd = {},
            template = baseFrag.replace(allParamNames, function (p) {
                if (lastInd[p] !== false) {
                    var ind = bindParams.indexOf(p, lastInd[p]);
                    if (ind < 0) lastInd[p] = false;
                    else return '$' + (lastInd[p] = ind + 1);
                }
                return p;
            });

        // input: fragment in [this] form
        // output: fragment in [out || this] form, [params] binded
        return _createConverter(outRoute, this, template);
    },

    // [out || this] with [this.params - params] binded, [params] unbinded
    unbinder: function (params) {
        var lastIndB = {},
            lastIndU = {},
            bParams = this.params,
            uParams = (new RouteInfo(params)).params,
            template = this.route.replace(allParamNames, function (p) {
                var unbinded;
                if (lastIndU[p] !== false) {
                    var uInd = uParams.indexOf(p, lastIndU[p]);
                    if (uInd < 0) lastIndU[p] = false;
                    else {
                        lastIndU[p] = uInd + 1;
                        unbinded = true;
                    }
                }

                if (lastIndB[p] !== false) {
                    var bInd = bParams.indexOf(p, lastIndB[p]);
                    if (bInd < 0) lastIndB[p] = false;
                    else {
                        lastIndB[p] = bInd + 1;

                        // if some param is unbinded,
                        // we skip it's corresponding analogous from bindings too
                        if (!unbinded) return '$' + lastIndB[p];
                    }
                }
                return p;
            });

        // input: fragment in [this] form
        // output: fragment in [out || this] form, [params] unbinded
        return _createConverter(this, this, template);
    },

    isEqualTo: function (other) {
        return other instanceof RouteInfo &&
            this.route === other.route
    }
});

function _createConverter(outRoute, srcRoute, template) {
    return function (routeFrag) {
        routeFrag = unwrap(routeFrag);
        var routeInfo = srcRoute;

        if (routeFrag instanceof RouteInfo) {
            routeInfo = routeFrag;
            routeFrag = routeInfo.route;
        }

        else if (routeFrag instanceof RouteFragment) {
            routeInfo = routeFrag.routeInfo;
            routeFrag = routeFrag.fragment;
        }

        else routeFrag = String(routeFrag || '');

        if (routeInfo !== srcRoute)
            routeFrag = routeInfo.binder(srcRoute)(routeFrag).fragment;

        return outRoute.create(routeFrag.replace(srcRoute.regexp, template));
    }
}
