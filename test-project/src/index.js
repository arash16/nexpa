import nx from 'nexable';
import Nexpa from 'nexpa';

let spa = new Nexpa();
let el = spa.nxDom.createElement.bind(spa.nxDom);
spa.init(nxShell);
spa.document.body.className = '';


function nxShell() {
    let val = nx();
    function onchng(e) {
        val(e.target.value)
    }

    let inp = <input type="text" onchange={onchng} oninput={onchng} value={val} />;

    let style = {
        marginLeft: nx(() => val() + 'px'),
        backgroundColor: 'black',
        width: '100px',
        height: '100px'
    };

    return <div>
        {inp}
        {val}
        {new Date(nx.now()).toTimeString()}
        <div style={style}></div>
    </div>;
}
