import { unwrap, identity, hasProp, isFunc, isNexable } from 'nxutils'
import nx from 'nexable'

function fnJoin(o1, f1, o2, f2) {
    if (!f1) return f2 && f2.bind(o2);
    if (!f2) return f1;

    return function () {
        let args = [];
        for (let i = 0; i < arguments.length; ++i)
            args.push(arguments[i]);

        f1.apply(o1, args);
        f2.apply(o2, args);
    }
}

function Component(Comp) {
    return function (props, children, namespace) {
        let comp = new Comp(props, children, namespace);
        return nx(() => {
            let result = comp.render();

            let dm = fnJoin(result, result.componentDidMount, comp, comp.componentDidMount);
            if (dm) result.componentDidMount = dm;

            let wm = fnJoin(result, result.componentWillMount, comp, comp.componentWillMount);
            if (wm) result.componentWillMount = dm;

            let du = fnJoin(result, result.componentDidUnmount, comp, comp.componentDidUnmount);
            if (du) result.componentDidUnmount = dm;

            let wu = fnJoin(result, result.componentWillUnmount, comp, comp.componentWillUnmount);
            if (wu) result.componentWillUnmount = dm;

            return result;
        });
    }
}


function TransitionItem(props, child) {
    let timer;
    let mountState = nx(0);

    // willAppear(cb) / didAppear // block other animations until cb
    // willEnter(cb)  / didEnter
    // willLeave(cb)  / didLeave  // keep it in the DOM until cb

    // example:
    //   willAppear: apply height:auto
    //   didAppear:  assign actual height, start transition from zero

    child.canUnmount = nx(() => {
        if (mountState() === 2)
            return true;

        mountState(1);
        timer = setTimeout(() => mountState(2), 2000);
    });

    child.componentDidMount = () => {
        clearTimeout(timer);
        mountState(0);
    };
    return child; /// nx(() => child);
}


function wrapChildren(props, children) {
    let oldChildren, wrappers = {};
    return nx(() => {
        let childs = unwrap(children).filter(identity);

        let newIds = {};
        let result = childs.map(ch => {
            newIds[ch.id] = true;
            if (!wrappers[ch.id])
                wrappers[ch.id] = new TransitionItem(props, ch);
            return wrappers[ch.id];
        });

        oldChildren && oldChildren.forEach(ch => {
            if (!newIds[ch.id])
                delete wrappers[ch.id];
        });

        return result;
    });
}

function TransitionGroup(props, children) {
    let childs = wrapChildren(props, children);

    let oldChildren;
    return nx(() => {
        let newChildren = unwrap(childs).map(unwrap);

        let newIds = {};
        newChildren.forEach(ch => newIds[ch.id] = true);

        if (oldChildren) {
            oldChildren.forEach((ch, i) => {
                if (!newIds[ch.id]) {
                    // initially we're not connecting to canUnmount
                    if (!nx.runDisconnected(ch.canUnmount.bind(ch))) {
                        // unless it is true, hence later is going to become false
                        ch.canUnmount();

                        newChildren.splice(i, 0, oldChildren[i]);
                    }
                }
            });
        }

        return oldChildren = newChildren;
    });
}


export default function () {
    let val = nx();
    let onchng = (e) => val(e.target.value);
    let inp = <input type="text" onchange={onchng} oninput={onchng} value={val}/>;


    let items = nx([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let addItem = (e) => {
        items.push(val());
        val('');
        return false;
    };

    let lst = items.map((x, i) =>
        <li>
            { x }
            <a onclick={ () => items.splice(i, 1) }>remove</a>
        </li>
    );

    let cnt = 10;
    setInterval(() => {
        let ind = parseInt(Math.random() * items.size());
        items.splice(ind, 1);
        items.push(cnt++);
    }, 2000);

    return nx(() =>
        <div>
            <ul><TransitionGroup>{ lst }</TransitionGroup></ul>

            <form onsubmit={addItem}>
                { inp }
            </form>
        </div>
    );
}
