import { unwrap, identity } from 'nxutils'
import nx from 'nexable'

export default function childrenManager(childs) {
    let oldChildren, oldIds;
    return nx(() => {
        let newChildren = unwrap(childs).filter(identity);

        let newIds = {};
        newChildren.forEach(ch => newIds[ch.id] = true);

        let willMount = newChildren, willUnmount;
        if (oldChildren) {
            willMount = willMount.filter(ch => !oldIds[ch.id]);
            willUnmount = [];

            oldChildren.forEach((ch) => {
                if (!newIds[ch.id])
                    willUnmount.push(ch);
            });
        }

        nx.runDisconnected(() => {
            willUnmount && willUnmount.forEach(ch => ch.componentWillUnmount());
            willMount.forEach(ch => ch.componentWillMount());
        });
        nx.afterSignal(() => {
            willUnmount && willUnmount.forEach(ch => ch.componentDidUnmount());
            willMount.forEach(ch => ch.componentDidMount());
        });

        oldIds = newIds;
        return oldChildren = newChildren;
    });
}


