defineView('list', function (contexts) {
    var ctx = this,
        tooltipRemove = { orient: 'top', content: l('Remove') },
        modalRemove = spa.modal(l('Remove'), l('Are you sure to remove this item?'), [
            { type: 'danger', value: l('Yes'), class: 'cursor-close' },
            { type: 'default', value: l('No') }
        ]),
        activeItem = nx(0),
        draggingItem = nx(0),
        dropzoneHovered = nx(''),
        dropzoneInsertionInd = nx(-1),
        itemsEl = nx(function () {
            return ctx.read().map(function (x, ind) {
                var panelClasses = nx(function () {
                        if (draggingItem() === x) return 'panel hide';
                        return 'panel ' + (x.validate().length ? 'panel-danger' : 'panel-default');
                    }),
                    isVisible = nx(function () {
                        var result = activeItem() === x;
                        setTimeout(function () {
                            if (result) itemEl.scrollToVisible();
                            else panel.refresh();
                        }, 80);
                        return result;
                    }),
                    itemEl = <div class={panelClasses}>
                        <div class="panel-heading" draggable="true" onclick={e => activeItem(activeItem.peek() === x ? 0 : x)}
                             ondragstart={onDragStart} ondragend={onDragEnd} ondragover={onDragOver}>
                            <a class="btn btn-alt btn-sm btn-danger" onclick={removeItem} tooltip={tooltipRemove}><Icon id="times"/></a>
                            <h4 class="panel-title">
                                <span class="ltr pull-right">{ x.getLeftSummary }</span>
                                <span>{ x.getSummary }</span>
                            </h4>
                        </div>
                        <slider id={ctx.id} class="panel-body" duration="300" visible={isVisible}>{ x.view }</slider>
                    </div>;
                return itemEl;

                function removeItem(e) {
                    modalRemove.show(function (result, ind) {
                        if (ind === 0)
                            ctx.remove(x);
                    });
                    e.stopPropagation();
                }

                function onDragStart(e) {
                    draggingItem(x);
                    var node = itemEl.getNode();
                    e.dataTransfer.setDragImage(node, node.offsetWidth / 2 | 0, 20);
                    e.dataTransfer.setData('text/plain', x.getSummary() || x.getLeftSummary() || x.getKey());
                }

                function onDragOver(e) {
                    if (draggingItem()) {
                        var height = itemEl.getNode().offsetHeight;
                        dropzoneInsertionInd(ind + (e.offsetY < height / 2 ? 1 : 0));
                    }
                }
            });
        }),
        emptyItem = <div class="form-control-static">[ { l('The list is empty') }. ]</div>,
        dummyDropZone = <div class={ "panel panel-default dropzone" + dropzoneHovered() }
                             ondragenter={onDragOverDropZone} ondragleave={() => dropzoneHovered('')}
                             ondragover={onDragOverDropZone} ondrop={onDrop}>
            <div class="panel-heading"></div>
        </div>,
        listItems = nx(function () {
            var result = unwrap(itemsEl),
                ind = unwrap(dropzoneInsertionInd);
            if (ind >= 0) {
                result = result.slice(0);
                result.splice(ind, 0, dummyDropZone);
            }
            return result.length ? result : [emptyItem];
        }),
        panel = <scrollable max-height="314">
            <div class="panel-group">{listItems}</div>
        </scrollable>,
        insertBtn = <div class="actions">
            <button type="button" class="btn btn-sm btn-success" onclick={newItem}>
                {(ctx.singularTitle ? ctx.singularTitle + ' ' : '') + l("New")}
            </button>
        </div>;

    function onDragEnd(e) {
        draggingItem(0);
        dropzoneHovered('');
        dropzoneInsertionInd(-1);
    }

    function onDragOverDropZone(e) {
        dropzoneHovered(' hover');
        e.preventDefault();
        return false;
    }

    function onDrop(e) {
        var result = ctx.read(),
            srcItem = draggingItem(),
            srcInd = result.indexOf(srcItem),
            destInd = dropzoneInsertionInd();

        if (destInd < srcInd || destInd > srcInd + 1) {
            result = result.slice(0);
            result.splice(srcInd, 1);
            result.splice(destInd - (srcInd < destInd), 0, srcItem);
            ctx.assign(result);
        }
        dropzoneInsertionInd(-1);
    }

    function newItem() {
        var item = ctx.insert();
        if (item) {
            nx.finally(() => panel.refresh());
            nx.afterNext(() => activeItem(item));
        }
    }

    return <div class="form-group list-field">
        <label>{ ctx.title }</label>
        { panel }
        { ifThen(!unwrap(ctx.readonly), insertBtn) }
    </div>;
});
