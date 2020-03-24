
class NodeList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        this.load();
        setInterval(() => this.load(), 15000);
    }

    async load() {
        let json = await myexec('kubectl get nodes');
        let nodes = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                status: pieces[1],
                roles: pieces[2],
                age: pieces[3],
                version: pieces[4],
            }
        });
        nodes = nodes.slice(1);
        this.setState({nodes});

        this.props.didLoad && this.props.didLoad(nodes);
    }

    render() {
        return (
            <div>
                <h3>All nodes</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Status</td>
                        <td>Roles</td>
                        <td>Age</td>
                        <td>Version</td>
                        <td/>
                    </tr>
                    {
                        this.state.nodes && this.state.nodes.map((node, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('node', node.name)}>{node.name}</a>
                                    </td>
                                    <td>{node.status}</td>
                                    <td>{node.roles}</td>
                                    <td>{node.age}</td>
                                    <td>{node.version}</td>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => showYamlEditor('node', node.name)}>YAML</a>
                                    </td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>
            </div>
        )
    }
}
