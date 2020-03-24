class StatefulSetList extends React.Component {
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
        let json = await myexec('kubectl get statefulset');
        let sets = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                desired: pieces[1],
                current: pieces[2],
                age: pieces[3],
            }
        });
        sets = sets.slice(1);
        this.setState({sets});
    }

    async scale(set_name) {
        let replicas = prompt('How many replicas do you want to scale');
        showAlert('scaling statefulset ' + set_name + '...');
        let json = await myexec(`kubectl scale statefulset ${set_name} --replicas=${replicas}`);
        showAlert(json[0]);
    }

    render() {
        return (
            <div>
                <h3>All StatefulSets</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Desired</td>
                        <td>Current</td>
                        <td>Age</td>
                        <td/>
                        <td/>
                    </tr>
                    {
                        this.state.sets && this.state.sets.map((set, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('statefulset', set.name)}>{set.name}</a>
                                    </td>
                                    <td>{set.desired}</td>
                                    <td>{set.current}</td>
                                    <td>{set.age}</td>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => showYamlEditor('statefulset', set.name)}>Yaml</a>
                                    </td>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => this.scale(set.name)}>Scale</a>
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
