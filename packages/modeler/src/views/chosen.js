var ChosenDefaultPlaceholder = l('Select an Option') + '..';

defineView('chosen', function (contexts) {
    var ctx = this,
        isOpen = nx(false),
        hoveredItem = nx(-1),
        clickEventHandler;

    function onSearchChange(e) {
        searchStr(e.target.value.toLowerCase());
    }

    function onKeyDown(e) {
        var c = e.keyCode;
        if (c === 13)
            return choseItem(hoveredItem());

        var dir = c === 40 ? 1 : c == 38 ? -1 : 0;
        if (dir) {
            var opts = options(),
                hovered = hoveredItem();

            for (var i = 0; i < opts.length && opts[i].option !== hovered; i++);
            if (i >= opts.length) i = dir > 0 ? 0 : opts.length - 1;
            else {
                do i += dir;
                while (i >= 0 && i < opts.length && !opts[i].visible());
            }
            if (i >= 0 && i < opts.length)
                hoveredItem(opts[i].option);
        }
    }

    function choseItem(item) {
        closeDropdown();
        if (item) ctx.assign(item.index);
        hoveredItem(item);
    }

    function openDropdown(e) {
        if (clickEventHandler)
            return searchEl.focus();

        var node = this;
        clickEventHandler = addListener(document, 'mousedown', function (e) {
            if (!node.contains(e.target) && !dropdownDiv.render.peek().contains(e.target))
                closeDropdown();
        });

        spa.activatePopup(dropdownDiv);
        nx.afterNext(() => isOpen(true));
    }

    function closeDropdown() {
        if (clickEventHandler) {
            removeListener(document, 'mousedown', clickEventHandler);
            isOpen(clickEventHandler = false);
        }
    }

    var searchStr = nx(''),
        searchEl = <input type="text" autocomplete="off" value={searchStr} onvaluechanged={onSearchChange}/>,
        options = nx.unwrap(ctx.options, function (opts) {
            return opts.map(function (o) {
                var isVisible = nx(() => o.toString().toLowerCase().indexOf(searchStr()) >= 0),
                    isSelected = nx(() => ctx.read() === o ? 'selected ' : ''),
                    isHovered = nx(() => hoveredItem() === o ? 'hover' : '');

                return {
                    option: o,
                    visible: isVisible,
                    element: <li class={isSelected() + isHovered()} onclick={onClick}
                                 onmousedown={stopPropagation} onmouseenter={() => hoveredItem(o) }>{ o.toString() }</li>
                };

                function onClick(e) {
                    choseItem(o);
                    e.stopPropagation();
                }
            });
        }),
        visibleOptions = nx(() => options().filter(x => x.visible()).map(x => x.element)),
        optionsEl = <ul class="options">{visibleOptions}</ul>,
        orient = nx(function () {
            if (!isOpen()) return orient.peek() || 'top';
            var viewMiddleLine = spa.window.scrollY() + spa.window.height() / 2 + 30;
            return inpGroup.absoluteOffsets().top > viewMiddleLine ? 'bottom' : 'top';
        }),
        dropdownStyles = nx(function () {
            var offs = inpGroup.absoluteOffsets(),
                ori = orient();

            return {
                top: ori == 'top' ? (offs.top + offs.height) + 'px' : 'auto',
                bottom: ori == 'bottom' ? (document.body.clientHeight - offs.top) + 'px' : 'auto',
                width: offs.width + 'px',
                left: offs.left + 'px'
            };
        }),
        dropdownDiv;

    function onDropClosed() {
        spa.deactivatePopup(dropdownDiv);
        searchStr('');
    }

    var inpGroup = baseFormControl(contexts, function (props, icon) {
        var dir = props.style.direction,
            controlClass = nx(() => 'chosen chosen-orient-' + orient() + (isOpen() ? ' active' : '')),
            placeholder = props.placeholder || ChosenDefaultPlaceholder,
            inputEl = <div class={'form-control ' + dir + (ctx.read() ? '' : ' default')} tabindex="-1">
                <Icon id="times" onclick={e => ctx.assign(null) || !clickEventHandler && e.stopPropagation()}/>
                <span>{tryStringify(ctx.read(), placeholder)}</span>
            </div>,
            searchDiv = <div class="search">{searchEl}<Icon id="search"/></div>;

        dropdownDiv = <div class={'drop-container ' + controlClass() + ' ' + dir} style={dropdownStyles}>
            <div class={'dropdown ' + dir}>
                <slider duration="300" visible={isOpen()} onOpen={() => hoveredItem(ctx.read())}
                        onOpened={() => searchEl.focus()} onClosed={onDropClosed}>
                    { orient() == 'top' ? searchDiv : optionsEl }
                    { orient() == 'bottom' ? searchDiv : optionsEl }
                </slider>
            </div>
        </div>;

        var childs = [
            inputEl,
            <div class="input-group-addon arrow"><Icon id="angle-down"/></div>
        ];

        if (dir == 'ltr') childs.reverse();
        if (icon) childs.push(<div class="input-group-addon arrow">{icon}</div>);

        return <div id={props.id} class={'input-group ' + controlClass()} onclick={openDropdown} onkeydown={onKeyDown}>
            {childs}
        </div>;
    }, true);

    return inpGroup;
});
