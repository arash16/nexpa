var elBehaviors = {},
    elBehaviorsKeys = [];

el.defineBehavior = function (name, handler) {
    if (!hasProp(elBehaviors, name))
        elBehaviorsKeys.push(name);
    elBehaviors[name] = handler;
};

function extractBehaviors(props) {
    var behaviors;
    for (var i = 0, bName; bName = elBehaviorsKeys[i]; i++) {
        var params = props[bName];
        delete props[bName];

        if (!isVoid(params)) {
            behaviors = behaviors || [];
            behaviors.push(elBehaviors[bName], params);
        }
    }

    return !behaviors ? identity : elem => applyBehaviors(elem, behaviors);
}

function applyBehaviors(elem, behaviors) {
    var result = elem;
    for (var i = 0; i < behaviors.length;) {
        var behavior = behaviors[i++],
            params = behaviors[i++];

        var bResult = behavior(result, params);
        if (!isVoid(bResult))
            result = bResult;
    }
    return result;
}
