class NamespaceList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {loading: false};
    }

    componentDidMount() {
        if (this.props.autoload) setInterval(() => this.load(), this.props.autoload);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({loading: true});
        this.load(nextProps.context).then(() => this.setState({loading: false}));
    }

    async load(context, force_reload = false) {

        if(!context) context = this.props.context;

        if(force_reload === false) {
            if(context === this.props.context) return;
            if(!context) return;
        }

        console.log('NamespaceList->load() context = ' + context);

        let json = await myexec('kubectl get ns --context=' + context);
        let text = json.join('<br/>').replace(/ /g,'&nbsp');
        let namespaces = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                status: pieces[1],
                age: pieces[2],
            }
        });
        namespaces = namespaces.slice(1);

        this.setState({text,namespaces});

        this.props.didLoad && this.props.didLoad(namespaces);
    }

    switchToNamespace(namespace) {
        this.props.onChange && this.props.onChange(namespace);
    }

    async deleteNamespace(namespace) {
        showAlert('Deleting namespace ' + namespace);
        myexec('kubectl delete ns ' + namespace);
        hideCustom();
        this.load(null, true);
    }

    viewDetail() {

        showWindow(
            <table className="table table-striped">
                <tbody>
                <tr>
                    <td>Name</td>
                    <td>Status</td>
                    <td>Age</td>
                    <td/>
                    <td/>
                </tr>
                {
                    this.state.namespaces && this.state.namespaces.map((namespace, index) => {
                        return (
                            <tr key={index}>
                                <td>{namespace.name}</td>
                                <td>{namespace.status}</td>
                                <td>{namespace.age}</td>
                                <td><a href="javascript:void(0)" onClick={() => this.switchToNamespace(namespace.name)}>Use</a></td>
                                <td><a href="javascript:void(0)" onClick={() => this.deleteNamespace(namespace.name)}>Delete</a></td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        ,'All namespaces');
        this.load();
    }

    render() {

        return (
            <div style={this.props.style}>
                <span>Namespace: </span>
                <select value={this.props.namespace} onChange={e => this.switchToNamespace(e.target.value)}>
                    {
                        this.state.namespaces && this.state.namespaces.map((namespace, index) => {
                            return <option key={index} value={namespace.name}>{namespace.name}</option>
                        })
                    }

                </select>
                &nbsp;&nbsp;&nbsp;<a href="javascript:void(0)" onClick={() => this.viewDetail()}>View detail</a>
                { this.state.loading ? <span>&nbsp;&nbsp;&nbsp; loading...</span> : ''}
            </div>
        );
    }
}
