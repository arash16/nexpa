import nx from 'nexable';
import nexpa from 'nexpa';
nexpa.init(nxShell);

nexpa.document.body.className = '';


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

// TODO: el -> nexpa.createElement
