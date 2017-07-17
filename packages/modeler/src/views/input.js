defineView('input', function (contexts) {
    var context = this,
        visibleValue = nx(),
        notify = true,
        s, e;

    var onInputHandler = getProp(contexts, 'onInput');


    nx.run(function () {
        context.valueOf();
        if (notify) visibleValue(undefined);
        else notify = true;
    });

    function onKeyDown(ev) {
        var t = ev.target;
        s = t.selectionStart;
        e = t.selectionEnd;
    }

    function onInput(ev) {
        var target = ev.target,
            current = context.toString(),
            rawNewVal = target.value;

        if (valEqual(rawNewVal, current, true)) return;

        var res = isFunc(onInputHandler)
                ? onInputHandler.call(context, current, rawNewVal)
                : {value: rawNewVal, parsed: rawNewVal},
            newVal = res.value;

        var dif = newVal.length - rawNewVal.length;

        notify = false;
        context.assign(res.parsed);
        notify = true;

        var ss = target.selectionStart + dif,
            ee = target.selectionEnd + dif;

        if (!valEqual(rawNewVal, newVal)) {
            nextFrame(function () {
                target.value = newVal;
                if (valEqual(current, newVal, true))
                    target.setSelectionRange(s, e);
                else target.setSelectionRange(ss, ee);
            });
        }

        visibleValue(newVal);
    }

    function onChange(ev) {
        onInput(ev);
        notify = true;
        visibleValue(undefined);
    }

    var nxElementValue = nx(function () {
        var v = visibleValue();
        return isUndefined(v) ? context.toString() : v;
    });

    var inputRows = getProp(contexts, 'rows');
    if (inputRows === true) inputRows = 4;
    else inputRows = (parseInt(inputRows) || 1) | 0;

    var extraClasses = getProp(contexts, 'class');

    return baseFormControl(contexts, function (elementProperties) {
        extend(elementProperties, {
            oninput: onInput,
            onchange: onChange,
            onkeydown: onKeyDown
        });

        if (extraClasses) {
            var c = elementProperties.class;
            elementProperties.class = (c ? c + ' ' : '') + extraClasses;
        }

        if (inputRows <= 1) {
            var elType = getProp(contexts, 'kind');
            elementProperties.type = String(elType != 'email' && elType || 'text');
            elementProperties.value = nxElementValue;
            return el('input', elementProperties);
        }
        else {
            elementProperties.rows = inputRows;
            return el('textarea', elementProperties, [el.rawText(nxElementValue)])
        }
    });
});
