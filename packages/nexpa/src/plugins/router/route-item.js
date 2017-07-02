function RouteItem(info, index, ownerRouter) {
    // extend(this, info);
    var item = this;

    item.index = index;
    item.router = ownerRouter;

    //-----------------------------------------------------------------------------------------------

    item.routeInfo = nx(function () {
        var result = unwrap(info.route);
        if (result instanceof RouteInfo) return result;
        return new RouteInfo(String(result || ''));
    });

    item.currentFragment = nx(function () {
        var path = unwrap(ownerRouter.activePath);
        if (!isVoid(path)) return item.routeInfo().create(String(path || ''));
    });

    item.activationData = nx(function () {
        var result = item.currentFragment();
        return result && result.params || item.activationData.peek();
    });

    item.isActive = nx(() => !!item.currentFragment());

    //-----------------------------------------------------------------------------------------------

    item.viewModelInstance = nx(function () {
        var vm = unwrap(info.component);
        return isFunc(vm) ? new vm(item) : vm;
    });

    item.viewModel = nx(function () {
        if (item.currentFragment()) {
            var vm = item.viewModelInstance();
            var params = isFunc(vm.activate) && item.activationData();

            //return nx.scope(function () {
            if (isFunc(vm.activate)) {
                var canActivate = vm.activate.apply(vm, params);
                if (isPromiseLike(canActivate))
                    return canActivate.then(cont);
            }
            return cont(canActivate);
        }
        function cont(result) {
            if (result || isUndefined(result))
                return vm;
        }
        //})();
    });

    item.view = nx(function () {
        var vm = item.viewModel();
        return vm && unwrap(vm.view);
    });

    //-----------------------------------------------------------------------------------------------

    item.hash = nx(function () {
        var result = unwrap(info.hash);
        if (isVoid(result)) result = unwrap(item.routeInfo).route;

        return item.router.resolve(result);
    });

    item.title = nx(() =>
        unwrap(info.title) ||
        unwrap(unwrap(item.viewModelInstance).title) ||
        unwrap(item.component.title)
    );

    item.icon = nx(() =>
        unwrap(info.icon) ||
        unwrap(unwrap(item.viewModelInstance).icon) ||
        unwrap(item.component.icon)
    );


    //-----------------------------------------------------------------------------------------------


    item.createChildRouter = function (childsRoute, itemsArr) {
        if (itemsArr) {
            var items = itemsArr,
                childsBaseRoute = nx(() => new RouteInfo(childsRoute));
        }
        else {
            items = childsRoute;
            childsBaseRoute = nx(() => new RouteInfo(unwrap(item.routeInfo).params));
        }

        var toChildsBase = nx(() =>  unwrap(item.routeInfo).binder(unwrap(childsBaseRoute))),
            toSelfBinder = nx(() =>  unwrap(childsBaseRoute).binder(unwrap(item.routeInfo)));

        var partialHash = nx(
            function () {
                // Top-Down route conversion
                var fullFragment = item.currentFragment();
                return fullFragment
                    ? unwrap(toChildsBase)(fullFragment).fragment
                    : partialHash.peek();

            }, hash => item.router.activeHash(resolve(hash))
        );


        // Bottom-Up route conversion
        function resolve(path) {
            if (unwrap(childsBaseRoute).regexp.test(path))
                path = unwrap(toSelfBinder)(path).fragment;

            return item.router.resolve(path);
        }

        return new Router(items, partialHash, item, resolve);
    };
}
