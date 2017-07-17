var reViewInputDirection = /^(.*[^a-z])?(left|ltr|en|l)([^a-z].*)?$/i,
    reIsFontIconId = /^[a-z]?i-[a-z0-9_-]+$/i;

function baseFormControl(contexts, fn, noGroup) {
    var elementName = String(getProp(contexts, 'name', 2) || '') || undefined,
        elementId = String(getProp(contexts, 'id', 2) || elementName || '') || ('input_' + contexts[0].vid),
        inputPlaceholder = String(getProp(contexts, 'placeholder') || '') || undefined,

        textAlign = String(getProp(contexts, ['textAlign', 'align']) || ''),
        textDirection = reViewInputDirection.test(getProp(contexts, 'direction') || textAlign) ? 'ltr' : 'rtl',
        className = 'form-control ' + textDirection,
        icon = String(getProp(contexts, 'icon') || '');

    // left ltr en l
    textAlign = (textAlign ? reViewInputDirection.test(textAlign) : textDirection == 'ltr') ? 'left' : 'right';
    if (reIsFontIconId.test(icon)) icon = <Icon id={icon}/>;
    var resultEl = fn({
        id: elementId,
        name: elementName,
        placeholder: inputPlaceholder,
        class: className,
        style: {
            direction: textDirection,
            textAlign: textAlign
        }
    }, icon || undefined);

    return icon && !noGroup ? <div class="input-group">
        {resultEl}
        <div class="input-group-addon">{icon}</div>
    </div> : resultEl;
}
