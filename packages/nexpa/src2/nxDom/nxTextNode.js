import { extend, unwrap, isValue, isVoid, isString, isNexable } from 'nxutils'
import nx from 'nexable'

export default function NXTextNode(eid, text) {
    let elem = this;
    elem.id = eid;
    elem.parent = nx();

    if (isNexable(text)) {
        elem.text = text;
        elem.render = nx(() => {
            let result = document.createTextNode('');
            nx.run(function () {
                let val = unwrap(elem.text);
                result.textContent = isVoid(val) ? '' : String(val);
            });
            return result;
        });
    }

    else {
        elem.text = isVoid(text) ? '' : String(text);
        elem.render = nx(() => document.createTextNode(elem.text));
    }
}

extend(NXTextNode.prototype, {
    isEqualTo: function (other) {
        if (other instanceof nxTextNode)
            return this.text === other.text;

        if (isValue(other)) other = String(other);
        if (isNexable(this.text) || isString(other))
            return this.text === other;
    }
});
