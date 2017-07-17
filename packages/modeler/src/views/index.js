var modelViews = {};

function defineView(name, fn) {
    if (isString(name)) {
        if (isFunc(fn)) modelViews[name] = fn;
        return modelViews[name];
    }
}

function useView(name, ctx, contexts) {
    var view = unwrap(name);
    if (isString(view))
        view = unwrap(modelViews[view]);

    if (view) {
        var context = unwrap(ctx);
        if (!isObjectLike(context))
            throw new Error('Invalid Context.');

        while (isFunc(view)) {
            view = unwrap(view.call(context, contexts));
            if (isString(view)) view = unwrap(modelViews[view]);
        }
    }
    return view;
}

import "./form";
import "./fieldset";

import "./base";
import "./input";
import "./switch";
import "./chosen";
import "./chosenMulti";
import "./calendar";
import "./list";
