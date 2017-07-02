var activeModals = nx.state([]),
    openModalsCount = nx(0);

registerGlobalElement(<div class="modals-container">
    <div class={ "modal-backdrop fade " + (openModalsCount() ? 'in' : 'invisible')}></div>
    {activeModals}
</div>);

spa.modal = function (title, body, buttons) {
    var result = nx(),
        fading = nx(false),
        visible = nx(false),
        header = !isString(title) ? title : <h3 class="modal-title">{title}</h3>,
        footerButtons = (buttons || [l('OK')]).map(function (btn, ind, arr) {
            var type = btn.type || (ind == arr.length - 1 ? 'primary' : 'default'),
                content = btn.value || btn,
                classes = 'btn btn-sm btn-' + type + (btn.class ? ' ' + btn.class : '');
            return <button type="button" class={classes} onclick={() => closeDialog(content, ind)}>{content}</button>;
        }),
        styles = nx(function () {
            return {
                display: visible() || fading() ? 'table' : 'none'
            };
        }),
        classes = nx(2, step => 'modal fade' + (visible() && step ? ' in' : '')),
        modalElem = <div style={styles} class={classes} onclick={closeNull}
                         tabindex="-1" role="dialog" aria-hidden="false">
            <div class="modal-dialog">
                <div class="modal-content" onclick={stopPropagation}>
                    <div class="modal-header">
                        <button type="button" class="close" aria-hidden="true" onclick={closeNull}>×</button>
                        {header}
                    </div>
                    <div class="modal-body">{body}</div>
                    <div class="modal-footer">{footerButtons}</div>
                </div>
            </div>
        </div>;

    function closeNull() {
        closeDialog(null);
    }

    function openDialog(onComplete) {
        if (visible.peek()) return;
        if (disposed) {
            disposed = false;
            activeModals(activeModals().concat(modalElem));
        }
        else if (closingTimer) clearTimeout(closingTimer);

        openModalsCount(openModalsCount.peek() + 1);
        closingTimer = undefined;
        visible(true);
        fading(false);
        result(undefined);
        if (isFunc(onComplete))
            onCompleteHandler = onComplete;
        return result;
    }

    function closeDialog(optionChosen, ind) {
        if (closingTimer) return;

        fading(true);
        visible(false);
        closingTimer = setTimeout(dispose, 400);
        result(optionChosen);
        if (isFunc(onCompleteHandler))
            onCompleteHandler(optionChosen, ind);
        openModalsCount(openModalsCount.peek() - 1);
    }

    function dispose() {
        closingTimer = undefined;
        if (disposed) return;

        disposed = true;
        visible(false);
        fading(false);
        var am = activeModals(),
            ind = am.indexOf(modalElem);
        if (ind >= 0) {
            am = am.slice();
            am.splice(ind, 1);
            activeModals(am);
        }
    }

    var disposed = true,
        onCompleteHandler,
        closingTimer;

    return { show: openDialog };
};
