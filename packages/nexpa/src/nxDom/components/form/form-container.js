el.defineComponent('form-container', function (props, childs) {
    return <form class="form-horizontal form-bordered"
                 action={props.action} method={props.method || 'post'}
                 onsubmit={props.submit}>
        {childs}
        <div class="form-group form-actions">
            <div class="col-md-9 col-md-offset-3">
                <button type="submit" class="btn btn-sm btn-primary">
                    <Icon id="angle-right"/> {l('Submit')}
                </button>
                <button type="reset" class="btn btn-sm btn-warning">
                    <Icon id="repeat"/> {l('Reset')}
                </button>
            </div>
        </div>
    </form>;
});
