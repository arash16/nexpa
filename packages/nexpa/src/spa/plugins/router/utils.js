var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g,
    routeStripper = /^#?[\/\\]*/,
    optionalParam = /\((.*?)\)/g,   //   m/n(/:id)
    namedParam = /(\(\?)?:\w+/g,    //   a/b/:id
    splatParam = /(\/*)\*\w*/g,     //   x/y/*rest
    allParamNames = /(\:[0-9a-z_.$]|\*)[0-9a-z_.$]*/gi,
    defaultPath = /\\([^])|\([^)]*\)|\/*[:*][0-9a-z_.$]*/gi,
    reCleanRoute = /^[\/\\#]+|[\/\\]+$/g,
    reRoutePart = /^([:*]?)([0-9a-z_.$]*)$/i;

function routeStrToRegExp(routeStr) {
    var reRoute = routeStr
        .replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, (match, optional) => optional ? match : '([^\/]+)')
        .replace(splatParam, '(?:$1(.+?)|(?:$1)?$)');

    return new RegExp('^' + reRoute + '$', 'i');
}
