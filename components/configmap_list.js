
class ConfigMapList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        setInterval(() => this.load(), 15000);
        bind('switch-context', data => this.load());
        bind('switch-namespace', data => this.load());
    }

    async load() {
        let json = await myexec('kubectl get configmaps');
        let secrets = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                type: pieces[1],
                data: pieces[2],
                age: pieces[3],
            }
        });
        secrets = secrets.slice(1);
        this.setState({secrets});
    }

    render() {
        return (
            <div>
                <h3>All configmaps</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Type</td>
                        <td>Data</td>
                        <td>Age</td>
                        <td/>
                    </tr>
                    {
                        this.state.secrets && this.state.secrets.map((secret, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('configmap', secret.name)}>{secret.name}</a>
                                    </td>
                                    <td>{secret.type}</td>
                                    <td>{secret.data}</td>
                                    <td>{secret.age}</td>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => showYamlEditor('configmap', secret.name)}>YAML</a>
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
