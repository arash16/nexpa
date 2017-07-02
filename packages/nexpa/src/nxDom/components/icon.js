var reIconIdReplacer = /(^\s*|(\s)\s+)((([a-z])i|i)-)?([^ ]+)/i;
function Icon(props) {
    var className = nx(function () {
        var id = unwrap(props.id) || 'circle-o',
            cls = unwrap(props.class);
        return id.replace(reIconIdReplacer, '$2$5i $5i-$6') + (cls ? ' ' + cls : '');
    });

    return el('i', extend({}, props, { class: className }));
}
