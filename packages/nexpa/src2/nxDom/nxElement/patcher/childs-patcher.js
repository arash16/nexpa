import { extend } from 'nxutils'


const
    APPEND_CHILD = 1,
    INSERT_CHILD = 2,
    REMOVE_CHILD = 3,
    REPLACE_CHILD = 4;


export default function ChildsPatcher(proxy, newItems, oldPatcher) {
    this.proxy = proxy;
    this.oldChilds = proxy._domNode.childNodes;
    this.oldItems = (oldPatcher || {}).items;

    this.items = newItems;
    this.patches = [];
}


/*
componentWillMount()
componentDidMount()
componentWillUnmount()
componentDidUnmount()
*/

extend(ChildsPatcher.prototype, {
    insertElem: function (ind, nextSiblingOldInd) {
        this.items[ind].parent(this.proxy._element);
        this.patches.push(INSERT_CHILD, ind, this.oldChilds[nextSiblingOldInd]);
    },
    replaceElem: function (ind, oldInd) {
        this.oldItems[oldInd].parent(undefined);
        this.items[ind].parent(this.proxy._element);
        this.patches.push(REPLACE_CHILD, ind, this.oldChilds[oldInd]);
    },
    removeElem: function (oldInd) {
        this.oldItems[oldInd].parent(undefined);
        this.patches.push(REMOVE_CHILD, this.oldChilds[oldInd]);
    },
    appendElem: function (ind) {
        this.items[ind].parent(this.proxy._element);
        this.patches.push(APPEND_CHILD, ind);
    },

    apply: function (newChilds) {
        let domNode = this.proxy._domNode,
            patches = this.patches;

        for (let i = 0, p; p = patches[i++];) switch (p) {
            case INSERT_CHILD:
                domNode.insertBefore(newChilds[patches[i++]], patches[i++]);
                break;

            case REPLACE_CHILD:
                domNode.replaceChild(newChilds[patches[i++]], patches[i++]);
                break;

            case REMOVE_CHILD:
                domNode.removeChild(patches[i++]);
                break;

            case APPEND_CHILD:
                domNode.appendChild(newChilds[patches[i++]]);
        }
    }
});
