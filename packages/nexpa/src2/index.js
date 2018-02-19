import { global, unwrap, nextFrame, isString, isUndefined, isFunc } from 'nxutils'
import nx from 'nexable'
import NXDom from './nxDom'
import { nxWindow } from './window'

class Nexpa {
    constructor(document) {
        this.nxDom = new NXDom();
        this.window = nxWindow;
        this.document = document || global.document;

        this.createElement = this.nxDom.createElement.bind(this.nxDom);
        this.defineComponent = this.nxDom.createElement.bind(this.nxDom);
        this.defineBehavior = this.nxDom.createElement.bind(this.nxDom);
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
}

function renderElement(nxElement) {
    nxElement = unwrap(nxElement);

    if (nxElement && isFunc(nxElement.render))
        return nxElement.render();

    throw new TypeError('Invalid child.');
}

const nexpa = new Nexpa();
nexpa.Nexpa = Nexpa;
export default nexpa;

// TODO: plugins
