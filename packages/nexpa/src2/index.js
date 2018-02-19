import { global, unwrap, nextFrame, isString, isUndefined, isFunc } from 'nxutils'
import nx from 'nexable'
import NXDom from './nxDom'
import { nxWindow } from './window'

export default class Nexpa {
    constructor(document) {
        this.nxDom = new NXDom();
        this.window = nxWindow;
        this.document = document || global.document;
    }

    init(renderFn, container) {
        if (isString(container))
            container = this.document.querySelector(container);

        if (isUndefined(container))
            container = this.document.body;

        return nx.run(() => {
            let tree = this.nxDom.createElement([renderFn()]),
                rootNode = renderElement(tree);

            container.appendChild(rootNode);
            // tree.emit('attached');

            nextFrame(function s() {
                nx.signal();
                nextFrame(s);
            });
            nx.onSignal(() => {
                let newRoot = renderElement(tree);
                if (newRoot !== rootNode) {
                    container.replaceChild(newRoot, rootNode);
                    rootNode = newRoot;
                }
            });

            return rootNode;
        });
    }

    createElement(tag, props, children) {
        return this.nxDom.createElement(tag, props, children);
    }

    defineComponent(name, ctor) {
        return this.nxDom.defineComponent(name, ctor);
    }

    defineBehavior(name, handler) {
        return this.nxDom.defineBehavior(name, handler);
    }
}

function renderElement(nxElement) {
    nxElement = unwrap(nxElement);

    if (nxElement && isFunc(nxElement.render))
        return nxElement.render();

    throw new TypeError('Invalid child.');
}

// plugins
