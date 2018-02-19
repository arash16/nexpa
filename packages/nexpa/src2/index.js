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

    render(rootElement, container) {
        if (isString(container))
            container = this.document.querySelector(container);

        if (isUndefined(container))
            container = this.document.body;

        return nx.run(() => {
            let rootNode = renderElement(rootElement);
            container.appendChild(rootNode);
            // rootElement.emit('attached');

            nextFrame(function s() {
                nx.signal();
                nextFrame(s);
            });
            nx.onSignal(() => {
                let newRoot = renderElement(rootElement);
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
    while (isFunc(nxElement))
        nxElement = nxElement();

    if (nxElement && isFunc(nxElement.render))
        return renderElement(nxElement.render());

    return nxElement;
}

const nexpa = new Nexpa();
nexpa.Nexpa = Nexpa;
export default nexpa;

// TODO: plugins
