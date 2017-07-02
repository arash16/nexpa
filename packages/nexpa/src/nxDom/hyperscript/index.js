import "./parse-children";
import "./components";
import "./behaviors";

function el(tag, props, children) {
    if (isObject(tag)) {
        children = props;
        props = tag;
        tag = 'div';
    }

    props = props || {};
    if (!children && isArray(props)) {
        children = props;
        props = {};
    }

    var behaviors = extractBehaviors(props),
        namespace = props.namespace,
        result;

    delete props.namespace;

    if (!namespace && isString(tag)) {
        tag = tag.toLowerCase();
        tag = elComponents[tag] || tag;
    }

    if (tag === 'virtual')
        result = parseChildren(children, true);

    else if (isFunc(tag))
        result = new tag(props, parseChildren(children, true), namespace);

    else if (isString(tag))
        result = new nxElement(tag, props, parseChildren(children), namespace);

    return behaviors(result);
}


el.rawText = function (textContent) {
    return new nxTextNode(textContent);
};

function shortHand(tag) {
    return (props, children) => el(tag, props, children);
}

el._a = function (props, children) {
    props.href = props.href || 'javascript:void(0)';
    return el('a', props, children);
};

iEval(function () {
    return ['p', 'i', 'b', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li',
            'div', 'span', 'small', 'strong', 'br', 'img', 'header', 'footer', 'section',
            'form', 'fieldset', 'legend', 'input', 'select', 'option', 'button', 'textarea', 'label'].map(function (t) {
            return 'el._' + t + ' = shortHand(\'' + t + '\');\n';
        }).join('');
});
