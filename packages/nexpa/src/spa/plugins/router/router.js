function Router(items, activePath, ownerItem, resolve) {
    var router = this;
    router.owner = ownerItem;
    router.activePath = activePath;
    router.activeHash = activePath;

    if (!isNexable(items, 'A'))
        items = nx.array(items);

    router.items = items.map(function (item, index) {
        var proto = unwrap(item);
        if (isFunc(proto)) proto = new proto(router, index);
        RouteItem.prototype = proto;
        return new RouteItem(proto, index, router);
    });


    router.activeItem = nx(function () {
        var sz = router.items.size();
        for (var i = 0; i < sz; i++) {
            var route = router.items(i);
            if (route.isActive()) {
                spa.window.title(route.title);
                return route;
            }
        }
    });

    router.activeFragment = nx(function () {
        var activeItem = unwrap(router.activeItem);
        return activeItem && unwrap(activeItem.currentFragment);
    });

    router.activeViewModel = nx(function () {
        var route = router.activeItem();
        return route && route.viewModel() || router.activeViewModel.peek();
    });

    router.activeView = nx(function () {
        var route = router.activeItem();
        return route && route.view() || router.activeView.peek();
    });


    router.resolve = function (path) {
        if (!(path instanceof RouteFragment)) {
            if (!isString(path)) return '#';
            if (path[0] === '#') return path;
        }

        path = String(path || '');

        // Sibling route conversion
        if (allParamNames.test(path)) {
            var active = router.activeFragment();
            if (active) {
                var tt = active.routeInfo.binder(path)(active);
                if (tt) path = tt.fragment;
            }
        }

        return isFunc(resolve) ?
               resolve(path) :
               '#' + path;
    };

    router.navigate = function (path) {
        nxWindow.activeHash(router.resolve(path));
    };

    router.link = function (props, childs) {
        return el('a', {
            href: nx(() => {
                var t = unwrap(props.href || props.hash);
                return isUndefined(t) ? 'javascript:void(0)' : router.resolve(t);
            }),
            class: props.class,
            title: props.title
        }, childs);
    };
}
