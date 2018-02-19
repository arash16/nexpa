import nx from 'nexable'

export default class App {
    constructor() {
        this.val = nx();

        let onchng = (e) => this.val(e.target.value);
        this.inp = <input type="text" onchange={onchng} oninput={onchng} value={this.val}/>;

        this.style = {
            marginLeft: nx(() => (parseInt(this.val()) | 0) + 'px'),
            backgroundColor: 'black',
            width: '100px',
            height: '100px'
        };
    }

    render() {
        return <div>
            {this.inp}
            {this.val}
            {new Date(nx.now()).toTimeString()}
            <div style={this.style}/>
        </div>;
    }
}
