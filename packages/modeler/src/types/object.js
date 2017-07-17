function refineFields(fields) {
    var refItems = [],
        len = fields.length,
        pids = refItems.pids = {};

    for (var i = 0; i < len; i++) {
        var field = fields[i],
            refItem = modeler.refine(field);

        if (refItem) {
            if (field.name) {
                var name = toValidIdentifier(field.name);

                pids[name] = pids[field.name] = refItems.length;
                if (name !== refItem.name)
                    refItem.name = name;
            }

            refItems.push(refItem);
        }
    }
    return refItems;
}

function refineTargets(obj, pids) {
    return unique(toArray(obj.targets || obj.target)
        .map(name => isNumber(pids[name]) ? pids[name] : parseInt(name))
        .filter(isValue));
}

function refineConditions(items, conditions) {
    var conds = unique(conditions),
        pids = items.pids,
        itemConds = {};

    for (i = 0; i < items.length; i++)
        itemConds[i] = toArray(items[i].condition);

    for (var i = 0, c; c = conds[i]; i++) if (c.expr) {
        var targets = refineTargets(c, pids);
        for (var j = 0; j < c.targets.length; j++) {
            var itemCond = itemConds[c.targets[j]];
            if (itemCond) itemCond.push(c.expr);
        }
    }

    for (i = 0; i < items.length; i++)
        items[i]._isVisible = createFunctor(itemConds[i]);
}

function refineValidators(items, validators) {
    var valds = unique(validators),
        pids = items.pids,
        result = [],
        itemValds = result.fields = {};

    for (i = 0; i < items.length; i++)
        if (isArray(items[i].validate))
            valds.push.apply(valds, items[i].validate);
        else if (isObject(items[i].validate))
            valds.push(items[i].validate);

    for (var i = 0, v; v = valds[i]; i++) {
        var checkValid = createFunctor(v.check || v),
            targets = refineTargets(v, pids),
            validator = {
                check: checkValid,
                error: v.error
            };

        if (!targets.length) result.push(validator)
        else for (var j = 0; j < v.targets.length; j++) {
            var targetId = v.targets[j];
            if (targetId) (itemValds[targetId] = itemValds[targetId] || []).push(validator);
        }
    }

    return result;
}

var undefinedField = {
    toString: constFunc(''),
    valueOf: nopFunc,
    toJSON: nopFunc,
    assign: nopFunc,
    write: nopFunc,
    read: nopFunc
};

defineType('object', {
    refine: function (s) {
        if (s.type === 'object' || (!s.type && isArray(s.fields))) {
            s.type = 'object';

            s.items = refineFields(s.fields);
            refineConditions(s.items, s.conditions);
            s.validators = refineValidators(s.items, s.validators);

            return s;
        }
    },
    create: function (meta, proto) {
        function TypedObject() {
            var me = this,
                nxItems = me.items.map(function (item) {
                    var fItem = modeler.create(item);
                    fItem.parent = me;
                    if (me.readonly && fItem.readonly !== false)
                        fItem.readonly = true;

                    fItem.isVisible = nx(() => fItem._isVisible(me));
                    return fItem;
                });


            var nxValue = {},
                nxFields = {},
                newItems = [],
                namedFields = {},
                allNamedFields = nxItems.filter(function (fItem) {
                    var item = fItem.create(),
                        name = newItems.push(item) && item.name;

                    if (name) {
                        if (namedFields[name]) namedFields[name].push(item);
                        else namedFields[name] = [item];

                        if (!hasProp(nxFields, name)) {
                            defineProp(nxFields, name, {
                                enumerable: true,
                                get: nx(function () {
                                    var fld = namedFields[name];
                                    for (var i = 0; i < fld.length; i++)
                                        if (fld[i].isVisible()) {
                                            var res = fld[i].read();
                                            if (!isUndefined(res))
                                                return fld[i];
                                        }
                                    return undefinedField;
                                })
                            });

                            defineProp(nxValue, name, {
                                enumerable: true,
                                get: nx(function () {
                                    return nxFields[name].read();
                                }),
                                set: nx(function (newValue) {
                                    var fld = namedFields[name];
                                    for (var i = 0; i < fld.length; i++)
                                        if (fld[i].isVisible())
                                            fld[i].assign(newValue);
                                })
                            })
                        }

                        return true;
                    }

                    // -> computed property (or union object)
                });

            me.data = nxValue;
            me.items = newItems;
            me.fields = nxFields;
            me.allItems = allNamedFields;
        }

        TypedObject.prototype = extend(proto, {
            read: function () {
                return this.data;
            },
            write: function (newValue) {
                if (isObject(newValue))
                    return newValue;
            },
            assign: function (newValue) {
                var me = this,
                    val = me.write(newValue);

                if (!isUndefined(val)) {
                    logger.log('writing: ', val, this.data);

                    for (var i = 0; i < me.allItems.length; i++) {
                        var p = me.allItems[i].name;
                        if (hasProp(val, p) && me.allItems[i].isVisible())
                            me.allItems[i].assign(val[p]);
                    }
                    return this.data;
                }
            },
            validate: function (val, errors) {
                var someFieldHasError = false;
                for (var i = 0; !errors.length && i < this.items.length; i++)
                    if (this.items[i].validate().length)
                        errors.push(l('Some fields has error.'));

                for (i = 0; i < this.validators.length; i++) {
                    var v = this.validators[i];
                    if (!v.check(this))
                        errors.push(v.error);
                }
                return v;
            },
            errorsOf: function (item) {
                var that = this,
                    result = item.validate();
                if (!result.length) {
                    var v = this.validators.fields[item.name];
                    if (v) return v.filter(x => x.check(that)).map(x => x.error);
                }
                return result;
            }
        });

        return TypedObject;
    },
    view: 'fieldset'
})

// visibleItems
