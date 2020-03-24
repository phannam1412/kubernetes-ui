
class ReplicaSetList extends React.Component {
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
        let json = await myexec('kubectl get rs');
        let sets = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                desired: pieces[1],
                current: pieces[2],
                ready: pieces[3],
                age: pieces[4],
            }
        });
        sets = sets.slice(1);
        this.setState({sets});
    }

    async scale(set) {
        let replicas = prompt('How many replicas do you want to scale');
        showAlert('scaling ReplicaSet ' + set + '...');
        let json = await myexec(`kubectl scale rs ${set} --replicas=${replicas}`);
        showAlert(json[0]);
    }

    async delete(set) {
        let text = await myexec('kubectl delete rs ' + set);
        showAlert(text[0]);
        this.load();
    }

    render() {
        return (
            <div>
                <h3>All ReplicaSets</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Desired</td>
                        <td>Current</td>
                        <td>Ready</td>
                        <td>Age</td>
                        <td/>
                        <td/>
                    </tr>
                    {
                        this.state.sets && this.state.sets.map((set, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('rs', set.name)}>{set.name}</a>
                                    </td>
                                    <td>{set.name}</td>
                                    <td>{set.desired}</td>
                                    <td>{set.current}</td>
                                    <td>{set.ready}</td>
                                    <td>{set.age}</td>
                                    <td><a href="javascript:void(0)" onClick={() => showYamlEditor('rs', set.name)}>YAML</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.scale(set.name)}>Scale</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.delete(set.name)}>Delete</a></td>
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
