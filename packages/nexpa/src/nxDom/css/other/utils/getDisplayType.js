// HTML elements default to an associated display type when they're not set to display:none.

// Note: This function is used for correctly setting the non-"none" display value
// in certain Velocity redirects, such as fadeIn/Out.

var __reInlineTagNames = /^(a|abbr|acronym|b|bdo|big|br|button|cite|code|dfn|em|i|img|input|kbd|label|map|object|q|samp|script|select|small|span|strong|sub|sup|textarea|tt|var)$/i;

function getDisplayType(element) {
    var tagName = element && element.tagName.toString().toLowerCase();

    if (__reInlineTagNames.test(tagName))
        return "inline";

    if (/^li$/i.test(tagName))
        return "list-item";

    if (/^tr$/i.test(tagName))
        return "table-row";

    if (/^table$/i.test(tagName))
        return "table";

    if (/^tbody$/i.test(tagName))
        return "table-row-group";

    return "block";
}
