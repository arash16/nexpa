var ChosenMultiDefaultPlaceholder = l('Select some Options') + '..';

defineView('chosenMulti', function (contexts) {
    var ctx = this,
        isOpen = nx(false),
        hoveredItem = nx(-1),
        options = nx.unwrap(ctx.options, function (opts) {
            return opts.map(function (o) {
                var isVisible = nx(() => o.toString().toLowerCase().indexOf(searchStr()) >= 0),
                    isSelected = nx(() => ctx.read().indexOf(o) >= 0 ? 'selected ' : ''),
                    isHovered = nx(() => hoveredItem() === o ? 'hover' : '');

                return {
                    option: o,
                    visible: isVisible,
                    selected: isSelected,
                    element: <li class={isSelected() + isHovered()} onclick={() => ctx.insert(o) && closeDropdown()}
                                 onmousedown={stopPropagation} onmouseenter={() => hoveredItem(o) }>{ o.toString() }</li>
                };
            });
        }),
        cachedChoices = [],
        clickEventHandler;

    function getChoice(item) {
        var choice = cachedChoices[item.index];
        if (!choice) {
            function onCloseClick(e) {
                ctx.remove(item);
                e.stopPropagation();
            }

            var classes = nx(false);
            choice = cachedChoices[item.index] = <li class="choice">
                <a onclick={onCloseClick}></a>
                <span>{item.toString()}</span>
            </li>;
        }
        return choice;
    }

    function openDropdown() {
        if (!clickEventHandler) {
            var node = this;
            clickEventHandler = addListener(document, 'mousedown', function (e) {
                if (!node.contains(e.target) && !dropdownDiv.render.peek().contains(e.target))
                    closeDropdown();
            });

            spa.activatePopup(dropdownDiv);
            nx.afterNext(() => isOpen(true));
        }
        searchEl.focus();
    }

    function closeDropdown() {
        if (clickEventHandler) {
            removeListener(document, 'mousedown', clickEventHandler);
            isOpen(clickEventHandler = false);
        }
    }

    function onSearchChange(e, val) {
        var nVal = tryStringify(val).toLowerCase();
        if (nVal != searchStr.peek()) {
            searchStr(nVal);
            var textWidth = searchEl.getContentWidth() + 25,
                containerWidth = inpGroup.getNode().offsetWidth,
                width = min(containerWidth - 10, textWidth);
            searchElWidth((width | 0) + 'px');
        }
    }

    function onKeyDown(e) {
        var c = e.keyCode;
        if (c === 13) {
            ctx.insert(hoveredItem());
            closeDropdown();
            return;
        }

        var dir = c === 40 ? 1 : c == 38 ? -1 : 0;
        if (dir === 1) openDropdown.call(this);
        if (dir) {
            var opts = options(),
                hovered = hoveredItem();

            for (var i = 0; i < opts.length && opts[i].option !== hovered; i++);

            if (i >= opts.length) i = dir > 0 ? 0 : opts.length - 1;
            else i += dir;

            while (i >= 0 && i < opts.length && (!opts[i].visible() || opts[i].selected()))
                i += dir;

            if (i >= 0 && i < opts.length)
                hoveredItem(opts[i].option);
        }
    }


    function onDropClosed() {
        spa.deactivatePopup(dropdownDiv);
        searchStr('');
    }

    var orient = nx(function () {
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
        dropdownDiv,
        searchStr = nx(''),
        searchElWidth = nx('25px'),
        searchEl = <input type="text" autocomplete="off" style={{width: searchElWidth}} value={searchStr} onvaluechanged={onSearchChange}/>,
        searchLi = <li class="search-field">{searchEl}</li>,

        inpGroup = baseFormControl(contexts, function (props, icon) {
            var dir = props.style.direction,
                controlClassDef = nx(() => 'chosen chosen-multi chosen-orient-' + orient() + ' ' + dir + (isOpen() ? ' active' : '')),
                placeholder = props.placeholder || ChosenDefaultPlaceholder;

            dropdownDiv = <div class={'drop-container ' + controlClassDef()} style={dropdownStyles}>
                <slider class="dropdown" duration="300" visible={isOpen} onOpen={() => hoveredItem(-1)} onClosed={onDropClosed}>
                    <ul class="options">
                        {options().map(x => x.visible() ? x.element : undefined)}
                    </ul>
                </slider>
            </div>;

            return <div class={'input-group ' + controlClassDef()} onkeydown={onKeyDown}>
                <ul class={'form-control choices' + (ctx.read() ? '' : ' default')} onclick={openDropdown}>
                    {ctx.read().map(getChoice)}
                    {searchLi}
                </ul>
            </div>;
        });

    return inpGroup;
});
