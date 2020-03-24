class ContextList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        this.load();
        if (this.props.autoload) setInterval(() => this.load(), this.props.autoload);
    }

    async load() {
        console.log('ContextList->load()');

        let json = await myexec('kubectl config get-contexts');
        let text = json.join('<br/>').replace(/ /g,'&nbsp');
        let contexts = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                current: pieces[0],
                name: pieces[1],
                cluster: pieces[2],
                authinfo: pieces[3],
                namespace: pieces[4],
            }
        });
        contexts = contexts.slice(1);

        let selected = '';
        contexts.forEach(item => selected = item.current === '*' ? item.name : selected);

        this.setState({text, contexts});

        this.props.didLoad && this.props.didLoad(contexts);
    }

    async switchContext(context) {
        this.props.onChange && this.props.onChange(context);
    }

    async viewDetail() {
        showWindow(this.state.text, 'All contexts');
        this.load();
    }

    render() {

        return (
            <div style={this.props.style}>
                <span>Context: </span>
                <select onChange={e => this.switchContext(e.target.value)} value={this.props.context}>
                    {
                        this.state.contexts && this.state.contexts.map((context, index) => {
                            return <option key={index} value={context.name}>{context.name}</option>
                        })
                    }
                </select>
                &nbsp;&nbsp;&nbsp;<a href="javascript:void(0)" onClick={() => this.viewDetail()}>View detail</a>
            </div>
        );

        return (
            <div style={this.props.style}>
                <h3>All contexts</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Current</td>
                        <td>Name</td>
                        <td>Cluster</td>
                        <td>Authinfo</td>
                        <td>Namespace</td>
                        <td/>
                    </tr>
                    {
                        this.state.contexts && this.state.contexts.map((context, index) => {
                            return (
                                <tr key={index}>
                                    <td>{context.current}</td>
                                    <td>{context.name}</td>
                                    <td>{context.cluster}</td>
                                    <td>{context.authinfo}</td>
                                    <td>{context.namespace}</td>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => this.switchContext(context.name)}>Use</a>
                                    </td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}
