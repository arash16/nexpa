function RouteFragment(routeInfo, fragment) {
    fragment = unwrap(fragment);

    if (fragment instanceof RouteFragment)
        return fragment.routeInfo === routeInfo && fragment;

    else if (fragment instanceof RouteInfo)
        fragment = fragment.route;

    var params = routeInfo.regexp.exec(fragment = String(fragment || ''));
    if (!params) return null;

    this.params = params.slice(1);
    this.routeInfo = routeInfo;
    this.fragment = fragment;
}

RouteFragment.prototype = rawObject({
    toString: function () { return this.fragment; },
    valueOf: function () { return this.params; },
    isEqualTo: function (other) {
        return other instanceof RouteFragment &&
            this.fragment === other.fragment &&
            this.routeInfo.isEqualTo(other.routeInfo);
    }
});
