var activeAlerts = nx.state([]);
registerGlobalElement(<div class="pop-alerts-container">{activeAlerts}</div>);

spa.alert = popAlert;
function popAlert(title, message, type) {
    function closeClick() {
        isVisible(false);
        autoRemoveTimer = setTimeout(function () {
            if (!isVisible() || forceClose) {
                var am = activeAlerts(),
                    ind = am.indexOf(alertDiv);

                if (ind >= 0) {
                    am = am.slice();
                    am.splice(ind, 1);
                    activeAlerts(am);
                }
            }
        }, 800);
    }

    function closeUserClick() {
        forceClose = true;
        closeClick();
    }

    function onMouseEnter() {
        if (!forceClose) {
            clearTimeout(autoRemoveTimer);
            isVisible(true);
        }
    }

    function onMouseLeave() {
        if (!forceClose)
            autoRemoveTimer = setTimeout(closeClick, 3000);
    }

    var forceClose = false,
        isVisible = nx(true),
        autoRemoveTimer = onMouseLeave(),
        classes = 'animation-slideLeft cursor-close pop-alert alert alert-' + (type || 'success'),
        styles = nx(function () {
            var mTop = alertDiv.getStyle('height,marginBottom', 0).map(x => parseFloat(x));
            return {
                opacity: isVisible() ? '1' : '0',
                marginTop: isVisible() ? '' : '-' + (mTop[0] + mTop[1]) + 'px'
            }
        }),
        alertDiv = <div class={classes} style={styles} onclick={closeUserClick}
                        onmouseenter={onMouseEnter} onmouseleave={onMouseLeave}>
            <h4>{title}</h4>
            <p>{message}</p>
        </div>;

    activeAlerts(activeAlerts().concat(alertDiv));
}

popAlert.success = function (title, message) {
    popAlert(title, message, 'success');
};

popAlert.warn = function (title, message) {
    popAlert(title, message, 'warning');
};

popAlert.error = function (title, message) {
    popAlert(title, message, 'error');
};

popAlert.info = function (title, message) {
    popAlert(title, message, 'info');
};
