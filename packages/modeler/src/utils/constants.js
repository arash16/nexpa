var Models = {
    Number: 'number',
    Select: 'select',
    Boolean: 'boolean',
    String: 'string',
    Script: 'script',
    File: 'file',
    Date: 'date',
    Time: 'time',
    NID: 'nid',

    List: 'list',
    Object: 'object',
    Extend: 'extend',
    Computed: 'computed',
    Dependent: 'dependent',
    Pointer: 'pointer',
    Entity: 'entity'
};


var Attributes = {
    ID: {
        name: 'id',
        is: function (x) { return isString(x) || isNumber(x) && !isNaN(x); },
        fix: tryStringify
    },
    Type: {
        name: 'type',
        is: function is(x) { return x && (isString(x) || is(x.type)); }
    },
    Name: {
        name: 'name',
        is: function (x) { return isString(x) && x; },
        fix: tryStringify
    },
    Title: {
        name: 'title',
        is: function (x) { return isString(x) && x; },
        fix: tryStringify
    },

    Value: {
        name: 'value',
        is: function (x) { return !isVoid(x); }
    },
    Initial: 'initial',
    Readonly: {
        name: 'readonly',
        is: isBool,
        fix: function (x) { return !!x || undefined; }
    },
    Editable: 'editable',

    Condition: 'condition',
    Conditions: 'conditions',
    Precision: 'precision',
    Multiple: 'multiple',
    Options: 'options',
    Fields: 'fields',
    Items: 'items',

    Min: 'min',
    Max: 'max',
    RegExp: 'regexp',
    Required: 'required',
    Validators: 'validators',
    Message: 'message',
    Targets: 'targets',
    Target: 'target',
    Check: 'check',
    Expr: 'expr',

    View: 'view',
    Kind: 'kind',
    Hint: 'hint',
    Help: 'help',
    Caption: 'caption',
    Description: 'description',
    Placeholder: 'placeholder',
    Direction: 'direction',
    TextAlign: 'textAlign',
    Rows: 'rows',
    Icon: 'icon'
};

eachKey(Attributes, function (id, att) {
    var pName = att.name || att;
    if (!isString(pName)) pName = id;

    function ensure(x) {
        if (att.is && !att.is(x))
            return att.fix ? att.fix(x) : undefined;

        return x;
    }

    function handler(obj, nval) {
        var newValue = nval;

        if (isUndefined(newValue))
            return pName in obj ? ensure(obj[pName]) : undefined;

        newValue = ensure(newValue);
        if (!isUndefined(newValue) && obj[pName] !== newValue)
            obj[pName] = newValue;
    }

    Attributes[id] = extend(handler, att);
});
