function fieldset(title, elements) {
    var legend = nx(function () {
        var t = unwrap(title);
        if (t) return <legend><Icon id="angle-right"/> { t }</legend>;
    });

    return <fieldset>{ legend } { elements }</fieldset>;
}


defineView('fieldset', function (contexts) {
    var context = this,
        title = getProp(contexts, 'title'),
        childs = [],
        row = [];

    function fieldWrapper(item, ind) {
        var errors = nx(() => context.errorsOf(item).map(e => <span class="help-block">{ '* ' + e }</span>));
        return <slider visible={item.isVisible} class={["form-group", errors().length && 'has-error']}>
            <label class="col-md-3 control-label" for={item.id}>
                { item.title }
                { item.required ? <span class="text-danger">*</span> : undefined }
            </label>

            <div class="col-md-8">
                { item.view }
                { item.hint && !item.readonly ? <span class="help-block">{ item.hint }</span> : undefined }
                { errors }
            </div>

            <div class="clearfix"/>
        </slider>;
    }

    for (var i = 0; i < context.items.length; i++) (function (item, i) {
        //if (item.type.name === 'list') {
        //    if (row.length) {
        //        childs.push(fieldset(title, row));
        //        row = [];
        //    }
        //    var fs = fieldset(item.title, item.view);
        //    childs.push(<slider visible={item.isVisible}>{fs}</slider>);
        //}

        row.push(item.type.name === 'list' ? item.view : fieldWrapper(item, i));
    })(context.items[i], i);

    if (row.length) childs.push(fieldset(title, row));
    return <div class="form-horizontal form-bordered">{ childs }</div>;
});


//return <div class="form-horizontal" data-bind="attr: { id: uid }">
//    <fieldset>
//        <legend data-bind="text: $data.legend, visible: $data.legend"></legend>
//
//        <!-- ko template: { foreach: visibleItems,
//                            beforeRemove: hideElement,
//                            afterAdd: showElement } -->
//        <div class="form-group" data-bind="css: { 'has-error': errors.length }, attr: {
//                    'rel': !readonly && $data.help && help._id ? 'popover' : '',
//                    'title': $data.help && help.title || '',
//                    'data-content': $data.help && $data.help.content || '' }">
//
//            <label class="col-sm-3 control-label" data-bind="attr: { 'for': uid }, visible: $data.title">
//                <!-- ko if: $data.help && help.hasMore -->
//                <a style="cursor: pointer" data-toggle="modal" data-bind="attr: { 'data-target': '#help_' + uid }">
//                    <i class="fa fa-info-circle"></i>
//                </a> &nbsp;
//
//                <div data-bind="attr: { id: 'help_' + uid }" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
//                    <div class="modal-dialog modal-lg">
//                        <div class="modal-content" style="text-align: justify; font-weight: 100">
//                            <div class="modal-header"><h4 class="modal-title" data-bind="text: help.title"></h4></div>
//                            <div class="modal-body" data-bind="html: help.more"></div>
//                        </div>
//                    </div>
//                </div>
//                <!-- /ko -->
//
//                <span data-bind="visible: ($data.title || '').trim(), text: $data.title + ' :'"></span>
//            </label>
//
//            <div data-bind="css: { 'col-sm-9': !!$data.title, 'col-sm-12': !$data.title }">
//                <div data-bind="form: $data, css: { well: $data.well }"></div>
//                <span class="help-block" data-bind="text: $data.hint, visible: $data.hint && !readonly"></span>
//                <!-- ko foreach: errors -->
//                <span class="help-block" data-bind="html: '* ' + $data"></span>
//                <!-- /ko -->
//            </div>
//        </div>
//        <!-- /ko -->
//    </fieldset>
//</div>;
