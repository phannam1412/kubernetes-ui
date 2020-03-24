
class DaemonSetList extends React.Component {
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
        let json = await myexec('kubectl get ds');
        let sets = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                desired: pieces[1],
                current: pieces[2],
                ready: pieces[3],
                up_to_date: pieces[4],
                available: pieces[5],
                node_selector: pieces[6],
                age: pieces[7],
            }
        });
        sets = sets.slice(1);
        this.setState({sets});
    }

    async scale(set) {
        let replicas = prompt('How many replicas do you want to scale');
        showAlert('scaling DaemonSet ' + set + '...');
        let json = await myexec(`kubectl scale ds ${set} --replicas=${replicas}`);
        showAlert(json[0]);
    }

    render() {
        return (
            <div>
                <h3>All DaemonSet</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Desired</td>
                        <td>Current</td>
                        <td>Ready</td>
                        <td>Up to date</td>
                        <td>Available</td>
                        <td>Node selector</td>
                        <td>Age</td>
                        <td/>
                    </tr>
                    {
                        this.state.sets && this.state.sets.map((set, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('ds', set.name)}>{set.name}</a>
                                    </td>
                                    <td>{set.name}</td>
                                    <td>{set.desired}</td>
                                    <td>{set.current}</td>
                                    <td>{set.ready}</td>
                                    <td>{set.up_to_date}</td>
                                    <td>{set.available}</td>
                                    <td>{set.node_selector}</td>
                                    <td>{set.age}</td>
                                    <td><a href="javascript:void(0)" onClick={() => showYamlEditor('ds', set.name)}>YAML</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.scale(set.name)}>Scale</a></td>
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
